import maplibregl from "maplibre-gl";
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';

import { addBanner, removeBanner } from "./banner.js";
import { apiCreateNode, apiLogout } from "./api.js";
import { auth, setAuth, removeAuth } from "./auth.js";
import { getFlyToOptions, isMobile } from "./utils.js";

export async function addControls(map, nodeManager) {
  addAttribution(map, "bottom-right");
  map.addControl(new maplibregl.FullscreenControl(), "top-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 80, unit: "imperial" }), "bottom-left");
  addGeocoder(map, nodeManager, "top-left");
  map.addControl(new maplibregl.NavigationControl(), "top-left");
  await addNodeManager(map, nodeManager, "top-left");
  map.addControl(new HelperControl(), "top-left");
}

function addGeocoder(map, nodeManager, location) {
  var Geo = {
    forwardGeocode: function (e) {
      const matchingFeatures = nodeManager.getGeoJSON().features.filter(feature => {
        const query = e.query.toLowerCase();
        const node = nodeManager.getNode(feature.properties.id);
        const name = node.name.toLowerCase();
        const owner = node.owner?.username.toLowerCase();
        return name.includes(query) || owner?.includes(query);
      }).map(feature => {
        const node = nodeManager.getNode(feature.properties.id);
        return {
          geometry: feature.geometry,
          properties: feature.properties,
          place_name: node.name + ", " + (!auth.isAuthenticated ? "" : (node.owner?.username ?? "<i>owner hidden</i>")),
          text: node.name,
        };
      });
      return { "features": matchingFeatures };
    },
  };

  const geocoder = new MaplibreGeocoder(Geo, {
    collapsed: isMobile(),
    limit: 8,
    debounceSearch: 0,
    minLength: 1,
    flyTo: getFlyToOptions(),
    marker: false,
    showResultMarkers: false,
    showResultsWhileTyping: true,
    enableEventLogging: false,
    maplibregl: maplibregl
  });

  geocoder.on("result", e => {
    nodeManager.setPopup(e.result.properties.id);
    document.querySelector(".maplibregl-ctrl-geocoder--input").blur();
  });

  map.addControl(geocoder, location);
}

function addAttribution(map, location) {
  const attribution = new maplibregl.AttributionControl({ compact: true });
  map.addControl(attribution, location);

  const controlContainer = map.getContainer().querySelector(".maplibregl-ctrl-bottom-right");
  const attributionControl = controlContainer.querySelector(".maplibregl-ctrl-attrib");
  if (!attributionControl) return;

  // hack to make attribution work with mkdocs styles
  const shadowHost = document.createElement("div");
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  controlContainer.appendChild(shadowHost);
  shadowRoot.appendChild(attributionControl);

  // hack to put map styles into attribution
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  const style = Array.from(links).find(link => link.href.includes('map'));
  if (style) shadowRoot.appendChild(style.cloneNode());
}

async function addNodeManager(map, nodeManager, location) {
  // wait for auth so the node manager control has valid state to set buttons
  await setAuth();
  map.addControl(new NodeManagerControl(nodeManager), location);
}

class HelperControl {
  _map = null;
  _controlContainer = null;
  _helpButton = null;
  _helpTitle = "Self-Reported Node Map";
  _helpMessage = `This map shows all the self-reported nodes in the
    Chicagoland area. If you would like, add your node(s) to this map, whether
    or not you are sharing your location via MQTT. This will help others
    easily identify you without the need for MQTT. Log in on the left panel to
    add your node and to view the owners of other nodes.`;

  onAdd(map) {
    this._map = map;
    this._controlContainer = this._createContainer();
    this._setupUI();
    this._showWelcomeBanner();
    this._addEventListeners();
    return this._controlContainer;
  }

  _createContainer() {
    const container = document.createElement("div");
    container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    container.addEventListener("contextmenu", (e) => e.preventDefault());
    return container;
  }

  _setupUI() {
    const button = document.createElement("button");
    button.className = "maplibregl-ctrl-help";
    button.type = "button";

    const label = localStorage.getItem("mapWelcomeBannerHidden") ? "Show the help banner" : "Hide the help banner";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);

    const icon = document.createElement("span");
    icon.className = "maplibregl-ctrl-icon";
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);

    button.addEventListener("click", this._onClick);

    this._helpButton = button;
    this._controlContainer.appendChild(button);
  }

  _addEventListeners() {
    document.addEventListener("banneropen", this._handleBannerChange);
    document.addEventListener("bannerclose", this._handleBannerChange);
  }

  onRemove() {
    this._removeEventListeners();
    if (this._controlContainer && this._controlContainer.parentNode) {
      this._controlContainer.parentNode.removeChild(this._controlContainer);
    }
    this._map = null;
    this._controlContainer = null;
  }

  _removeEventListeners() {
    document.removeEventListener("banneropen", this._handleBannerChange);
    document.removeEventListener("bannerclose", this._handleBannerChange);
  }

  _showWelcomeBanner() {
    if (!localStorage.getItem("mapWelcomeBannerHidden")) {
      this._addBanner();
    }
  }

  _onClick = () => {
    if (this._isBannerOpen()) {
      this._removeBanner();
    } else {
      this._addBanner();
    }
  };

  _isBannerOpen() {
    const banner = document.getElementById("helper-banner");
    return banner && banner.querySelector("p").innerText == this._helpTitle;
  }

  _addBanner() {
    addBanner(this._helpTitle, this._helpMessage, {
      close: true,
      customCloseHandler: this._onBannerClose
    });
  }

  _removeBanner() {
    removeBanner();
    this._onBannerClose();
  }

  _onBannerClose = () => {
    localStorage.setItem("mapWelcomeBannerHidden", true);
  };

  _handleBannerChange = () => {
    this._updateLabel();
  };

  _updateLabel() {
    const label = this._isBannerOpen() ? "Hide the help banner" : "Show the help banner";
    this._helpButton.setAttribute("aria-label", label);
    this._helpButton.setAttribute("title", label);
  }
}

class NodeManagerControl {
  _map = null;
  _canvasContainer = null;
  _controlContainer = null;

  _adding = false;
  _addButton = null;
  _form = document.getElementById("node-form");
  _formCloseButton = this._form.querySelector(".form-button[type='button']");
  _formModal = this._form.closest(".modal-overlay");

  constructor(nodeManager) {
    if (!nodeManager || typeof nodeManager !== "object")  {
      throw new Error("NodeManagerControl constructor requires 'nodeManager' object.")
    }
    this._nodeManager = nodeManager;
  }

  onAdd(map) {
    this._map = map;
    if (!this._canvasContainer) this._canvasContainer = this._map.getCanvasContainer();
    this._controlContainer = this._createContainer();
    this._setupUI();
    this._handleAuthExpiration();
    return this._controlContainer;
  }

  onRemove() {
    if (this._controlContainer && this._controlContainer.parentNode) this._controlContainer.parentNode.removeChild(this._controlContainer);
    this._map = null;
    this._controlContainer = null;
    this._removeAuthExpiration();
  }

  _createContainer() {
    const container = document.createElement("div");
    container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    container.addEventListener("contextmenu", (e) => e.preventDefault());
    return container;
  }

  _setupUI() {
    this._createButton({
      label: auth.isAuthenticated ? "Logout" : "Login",
      class: auth.isAuthenticated
        ? "maplibregl-ctrl-logout"
        : "maplibregl-ctrl-login",
      handler: this._handleAuthentication,
    });

    this._createButton({
      label: "Go to Node(s)",
      class: "maplibregl-ctrl-home",
      handler: this._nodeManager.flyToSelf,
    });

    this._addButton = this._createButton({
      label: "Add Node",
      class: "maplibregl-ctrl-marker-add",
      handler: this._handleAddNode,
    });
  }

  _createButton({ label, class: className, handler }) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);

    const icon = document.createElement("span");
    icon.className = "maplibregl-ctrl-icon";
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);

    if (!auth.isAuthenticated && className !== "maplibregl-ctrl-login") {
      button.style.cursor = "not-allowed";
      button.firstElementChild.style.filter = "contrast(0.1)";
    } else {
      button.addEventListener("click", handler);
    }

    this._controlContainer.appendChild(button);
    return button;
  }

  _handleAuthentication = async () => {
    if (!auth.isAuthenticated) {
      this._handleLogin();
    } else {
      this._handleLogout();
    }
  }

  _handleLogin() {
    window.open("/api/login", "_self");
  }

  _handleLogout() {
    apiLogout().then(() => {
      removeAuth();
      this._nodeManager.removeNodeOwners();
      this._nodeManager.updatePopup();
      this._updateUI();
      if (this._isAddingNode()) {
        this._disableAddNodeMode();
      }
    });
  }

  _handleAuthExpiration() {
    if (!auth.isAuthenticated) {
      return
    }

    if (this._authExpirationIntervalId) {
      clearInterval(this._authExpirationIntervalId);
    }

    const checkExpiration = () => {
      if (!auth.isAuthenticated) {
        clearInterval(this._authExpirationIntervalId);
        this._authExpirationIntervalId = null;
        return
      }

      if (Date.now() >= new Date(auth.expiresAt).getTime() - 10000) {
        this._authExpirationIntervalId = null;
        clearInterval(this._authExpirationIntervalId);
        removeAuth();
        this._nodeManager.updatePopup();
        this._nodeManager.removeNodeOwners();
        this._updateUI();
        if (this._isAddingNode()) {
          this._disableAddNodeMode();
        }
      }
    }

    this._authExpirationIntervalId = setInterval(checkExpiration, 5000);
  }

  _removeAuthExpiration() {
    this._authExpirationIntervalId = null;
    clearInterval(this._authExpirationIntervalId);
  }

  _updateUI() {
    while (this._controlContainer.firstChild) {
      this._controlContainer.removeChild(this._controlContainer.firstChild);
    }
    this._setupUI();
  }

  _handleAddNode = () => {
    if (this._isAddingNode()) {
      this._disableAddNodeMode();
    } else {
      this._enableAddNodeMode();
    }
  }

  _isAddingNode() {
    return this._adding;
  }

  _enableAddNodeMode() {
    this._adding = true;
    this._setNodeCreateUI();
    this._map.once("click", this._onClickMap);
  }

  _disableAddNodeMode() {
    this._adding = false;
    this._resetNodeCreateUI();
    this._map.off("click", this._onClickMap);
  }

  _setNodeCreateUI() {
    addBanner(
      "Create Mode Enabled",
      "Create a new node by clicking on the map then filling out its information.",
      { lock: true },
    );

    this._canvasContainer.style.cursor = "crosshair";
    if (this._addButton) this._addButton.style.boxShadow = "inset 0px 0px 5px #8a8a8a";

    this._map.on("dragstart", this._onDragStart);
    this._map.on("dragend", this._onDragEnd);

    this._map.setPaintProperty("nodes", "circle-opacity", 0.3);
    this._map.setPaintProperty("nodes", "circle-stroke-opacity", 0.3);

    this._nodeManager.removeEventListeners();
  }

  _resetNodeCreateUI() {
    removeBanner();

    this._canvasContainer.style.cursor = "";
    if (this._addButton) this._addButton.style.boxShadow = "";

    this._map.off("dragstart", this._onDragStart);
    this._map.off("dragend", this._onDragEnd);

    this._map.setPaintProperty("nodes", "circle-opacity", 1);
    this._map.setPaintProperty("nodes", "circle-stroke-opacity", 1);

    this._nodeManager.setEventListeners();
  }

  _onDragStart = () => {
    this._canvasContainer.style.cursor = "grabbing";
  };

  _onDragEnd = () => {
    this._canvasContainer.style.cursor = "crosshair";
  };

  _onClickMap = (e) => {
    e.preventDefault();

    this._form.addEventListener("submit", this._submitNodeForm);
    this._formCloseButton.addEventListener("click", this._hideNodeForm);

    this._showNodeForm(e.lngLat);

    this._disableAddNodeMode();
  }

  _showNodeForm(lngLat) {
    const { lng, lat } = lngLat;

    let longitude = this._form.querySelector("input[name='longitude']");
    if (!longitude) {
      longitude = document.createElement("input");
      longitude.type = "hidden";
      longitude.name = "longitude";
      this._form.appendChild(longitude);
    }
    longitude.value = lng;

    let latitude = this._form.querySelector("input[name='latitude']");
    if (!latitude) {
      latitude = document.createElement("input");
      latitude.type = "hidden";
      latitude.name = "latitude";
      this._form.appendChild(latitude);
    }
    latitude.value = lat;

    this._formModal.classList.remove("hidden");
  }

  _hideNodeForm = () => {
    this._formModal.classList.add("hidden");
    this._form.removeEventListener("submit", this._submitNodeForm);
    this._formCloseButton.removeEventListener("click", this._hideNodeForm);
  }

  _submitNodeForm = (e) => {
    e.preventDefault();

    apiCreateNode(this._form).then(node => {
      this._nodeManager.addNode(node);
      this._nodeManager.setPopup(node.id);

      this._form.reset();

      addBanner(
        "Success",
        `Created node '${node.name}'`,
        { color: "#008000", duration: 10000, close: true }
      );
    });

    this._hideNodeForm();
  }
}
