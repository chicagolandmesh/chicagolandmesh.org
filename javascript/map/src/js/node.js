import maplibregl from "maplibre-gl";

import { apiGetNodes, apiUpdateCoordinates, apiUpdateNode, apiDeleteNode, apiGetLocations } from "./api.js";
import { addBanner, removeBanner } from "./banner.js";
import { formatDate, getFlyToOptions, isMobile, uppercase, withFallback } from "./utils.js";
import { auth } from "./auth.js";
import { ConvertLngToDMS, ConvertLatToDMS } from "./utils.js";

export class NodeManager {
  _map = null;
  _nodes = null;
  _isSetting = null;
  _geojson = null;

  _popup = null;
  _selectedNodeId = null;
  _hoverNodeId = null;

  _locations = null;
  _totalLocations = null;
  _lastLocation = null;

  _moving = null;
  _movingNodeId = null;
  _index = null;
  _source = null;

  constructor(map) {
    this._map = map;
  }

  async setNodes() {
    if (!this._nodes) {
      const nodes = await apiGetNodes();
      this._nodes = new Map(nodes.map((n) => [n.id, n]));
    }

    this._setGeoJSON(this._nodes);

    this.setEventListeners();
  }

  _setGeoJSON(nodes) {
    this._geojson = {
      type: "FeatureCollection",
      features: [...nodes].map(([_, node]) => ({
        type: "Feature",
        properties: {
          id: node.id,
          protocol: node.protocol,
        },
        geometry: {
          type: "Point",
          coordinates: node.lngLat,
        },
      })),
    };

    this._map.addSource("nodes", {
      type: "geojson",
      promoteId: "id",
      data: this._geojson,
    });
    this._source = this._map.getSource("nodes");

    this._map.addLayer({
      id: "nodes",
      type: "circle",
      source: "nodes",
      paint: {
        "circle-radius": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          8,
          ["boolean", ["feature-state", "select"], false],
          8,
          6,
        ],
        "circle-color": [
          "case",
          ["==", ["get", "protocol"], "meshcore"], "#164a88",
          ["==", ["get", "protocol"], "meshtastic"], "#1fd85a",
          ["==", ["get", "protocol"], "reticulum"], "#ffffff",
          "#000000",
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": [
          "case", ["==", ["get", "protocol"], "reticulum"], "#000000",
          "#ffffff",
        ],
      },
    });
  }

  getGeoJSON() {
    return this._geojson;
  }

  addNode(node) {
    this._geojson.features.push({
      type: "Feature",
      properties: {
        id: node.id,
        protocol: node.protocol,
      },
      geometry: {
        type: "Point",
        coordinates: node.lngLat,
      },
    });

    this._nodes.set(node.id, node);

    this._source.setData(this._geojson);

    this._setLocationsToUpdate();
  }

  getNode(nodeId) {
    return this._nodes.get(nodeId);
  }

  updateNode(nodeId, node) {
    // HACK: update privacy setting of every node owned by owner as
    // it is a global setting but set on each node individually
    if (node.owner.privacy != this._nodes.get(nodeId).privacy) {
      for (const n of this._nodes.values()) {
        if (n?.owner?.id == node.owner.id) {
          n.owner.privacy = node.owner.privacy;
        }
      }
    }

    this._nodes.set(nodeId, node);

    const featureIndex = this._geojson.features.findIndex((n) => n.properties.id == nodeId);
    this._geojson.features[featureIndex] = {
      type: "Feature",
      properties: {
        id: node.id,
        protocol: node.protocol,
      },
      geometry: {
        type: "Point",
        coordinates: node.lngLat,
      },
    };
    this._source.setData(this._geojson);

    if (this._popup) {
      this._popup.setDOMContent(this._createNodeDOM(node));
      this._setPopupButtons(this._popup);
    }

    this._setLocationsToUpdate();
  }

  deleteNode(nodeId) {
    this._nodes.delete(nodeId);

    this._geojson.features = this._geojson.features.filter((n) => n.properties.id != nodeId);
    this._source.setData(this._geojson);

    if (this._popup) {
      this._popup.getElement().remove();
      this._popup = null;
    }

    this._setLocationsToUpdate();
  }

  // see L#121
  removeNodeOwners() {
    for (const n of this._nodes.values()) {
      delete n.owner;
    }
  }

  setPopup(id, altLngLat) {
    const node = this._nodes.get(id);

    if (id == this._selectedNodeId) {
      return;
    }

    if (this._popup) {
      this._popup.remove();
    }

    const popup = new maplibregl.Popup({
      maxWidth: "9.6rem",
      focusAfterOpen: false,
      offset: 10,
    })
      .setLngLat(altLngLat || node.lngLat)
      .setDOMContent(this._createNodeDOM(node))
      .addTo(this._map);
    this._popup = popup;

    const spacer = document.createElement("div");
    spacer.classList.add("maplibregl-popup-spacer");
    popup.getElement().append(spacer);

    this._setPopupButtons(popup);

    popup.on("close", () => {
      this._map.setFeatureState({ source: "nodes", id: node.id }, { select: false });
      if (this._popup === popup) this._popup = null;
      if (this._selectedNodeId == node.id) this._selectedNodeId = null;
    });

    this._map.setFeatureState({ source: "nodes", id: node.id }, { select: true });
    this._selectedNodeId = node.id;
  }

  _setPopupButtons(popup) {
    const footer = popup.getElement().querySelector(".popup-buttons");
    if (footer) {
      const moveBtn = footer.querySelector("#popup-move-button");
      const editBtn = footer.querySelector("#popup-edit-button");
      const deleteBtn = footer.querySelector("#popup-delete-button");

      moveBtn.addEventListener("click", this._handleMoveNodeButton);
      editBtn.addEventListener("click", this._handleEditNodeButton);
      deleteBtn.addEventListener("click", this._handleDeleteNodeButton);

      if (this._moving) {
        editBtn.disabled = true;
        deleteBtn.disabled = true;
      }
    }
  }

  _createNodeDOM(node) {
    const name = node.name || "Anonymous";

    function formatOwner(owner) {
      if (!owner) {
        return auth.isAuthenticated ? "<i>hidden</i>" : "";
      }
      return `<a href="https://discord.com/users/${owner.id}" target="_blank">${owner.username}</a>`
    }

    function formatProtocol(protocol) {
      switch (protocol) {
        case "meshcore":
          return "MeshCore";
        case "meshtastic":
          return "Meshtastic";
        case "reticulum":
          return "Reticulum";
      }
    }

    function formatRole(role) {
      switch (role) {
        case "kiss":
          return "KISS Modem";
        case "rnode":
          return "RNode";
        case "generic":
          return "Generic Radio";
        case "ax25":
          return "AX.25 KISS";
        case "tnc":
          return "TNC KISS";
        default:
          return uppercase(role);
      }
    }

    function formatElevation(elevation) {
      if (!elevation) return null;
      return `${elevation} ft`;
    }

    function setPublicKey(popup, publicKey) {
      if (!publicKey) return;

      const publicKeyEl = popup.querySelector("[data-action='copy']");

      const link = document.createElement("a");
      link.title = publicKey;
      link.style.cursor = "pointer";
      link.textContent = `${publicKey.slice(0, 12)}...${publicKey.slice(-12)}`;
      publicKeyEl.replaceChildren(link);

      publicKeyEl?.addEventListener("click", (e) => {
        e.preventDefault();

        navigator.clipboard.writeText(publicKey);

        addBanner("Success", "Copied to clipboard!", {
          duration: 2000,
          close: true,
          color: "#008000",
          stack: true
        });
      });
    }

    const footer = this._createPopupFooterHTML(node?.owner?.id);

    const popup = document.createElement("div");
    popup.innerHTML = `
      <header class="popup-header" style="display: flex; flex-direction: column;">
        <span><b></b></span>
        <span><small>${ConvertLatToDMS(node.lngLat[1])}, ${ConvertLngToDMS(node.lngLat[0])}</small></span>
      </header>

      <div class="popup-content">
        <table>
          ${node.owner ? `<tr><td>Owner:</td><td>${formatOwner(node.owner)}</td></tr>` : ``}
          <tr>
            <td>Public Key:</td>
            <td data-action="copy"><i style="opacity:0.6;">unset</i></td>
          </tr>
          <tr>
            <td>Device:</td>
            <td>${withFallback(window.deviceNames.get(node.device))}
          </td>
          </tr>
          <tr>
            <td>Protocol:</td>
            <td>${formatProtocol(node.protocol)}</td>
          </tr>
          <tr>
            <td>Power:</td>
            <td>${withFallback(uppercase(node.power))}</td>
          </tr>
          <tr>
            <td>Role:</td>
            <td>${formatRole(node.role)}</td>
          </tr>
          <tr>
            <td>Elevation:</td>
            <td>${withFallback(formatElevation(node.elevation))}</td>
          </tr>
          <tr>
            <td>Frequency:</td>
            <td>${node.frequency} MHz</td>
          </tr>
          <tr>
            <td>${node.protocol == "reticulum" ? "Relay" : "MQTT"}:</td>
            <td>${node.mqttUplink ? `<span style="color: #10c743;">Connected</span>` : `<span style="color: #ff2c2c;">Disconnected</span>`}</td>
          </tr>
        </table>
      </div>

      <div class="popup-content">
        <small style="font-size: 0.75em; white-space: nowrap;">
          <em>Created on ${formatDate(node.createdAt)}</em>
          ${node.updatedAt ? `<br><em>Updated on ${formatDate(node.updatedAt)}</em>` : ""}
        </small>
      </div>

      ${footer}
    `;

    popup.querySelector("header span b").innerText = name;

    setPublicKey(popup, node.publicKey);

    return popup;
  }

  _createPopupFooterHTML(nodeUserId) {
    if (auth.userId != null && auth.userId == nodeUserId) {
      return `<hr style="margin:0">

      <div class="popup-footer popup-buttons">
        <button id="popup-move-button" aria-label="Move node position">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 24px; height: 24px;">
            <path d="M22.67,12L18.18,16.5L15.67,14L17.65,12L15.67,10.04L18.18,7.53L22.67,12M12,1.33L16.47,5.82L13.96,8.33L12,6.35L10,8.33L7.5,5.82L12,1.33M12,22.67L7.53,18.18L10.04,15.67L12,17.65L14,15.67L16.5,18.18L12,22.67M1.33,12L5.82,7.5L8.33,10L6.35,12L8.33,13.96L5.82,16.47L1.33,12M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z" />
          </svg>
        </button>
        <button id="popup-edit-button" aria-label="Edit node information">
          <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 24px; height: 24px;">
            <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H10V20.1L20 10.1V8L14 2H6M13 3.5L18.5 9H13V3.5M20.1 13C20 13 19.8 13.1 19.7 13.2L18.7 14.2L20.8 16.3L21.8 15.3C22 15.1 22 14.7 21.8 14.5L20.5 13.2C20.4 13.1 20.3 13 20.1 13M18.1 14.8L12 20.9V23H14.1L20.2 16.9L18.1 14.8Z" />
          </svg>
        </button>
        <button id="popup-delete-button" aria-label="Delete node">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 24px; height: 24px;">
            <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M9,8H11V17H9V8M13,8H15V17H13V8Z" />
          </svg>
        </button>
      </div>`;
    } else if (!auth.isAuthenticated) {
      return `<hr style="margin:0">

      <div class="popup-footer">
        <i>Your node? <a href="/api/map/login">Login</a> to edit</i>
      </div>`;
    } else {
      return "";
    }
  }

  updatePopup() {
    const nodeId = this._selectedNodeId;
    if (nodeId && this._popup) {
      const node = this._nodes.get(nodeId);
      this._popup.setDOMContent(this._createNodeDOM(node));
    }
  }

  flyToSelf = async () => {
    if (!this._locations) {
      const locations = await apiGetLocations();
      this._locations = locations;
      this._totalLocations = locations.length;
    }

    if (!this._locations || this._locations.length === 0) {
      return;
    }

    let index;
    if (this._lastLocation == null || this._lastLocation >= this._locations.length - 1) {
      index = 0;
    } else {
      index = this._lastLocation + 1;
    }

    const node = this._locations[index];
    this.flyTo(node.lngLat);
    this.setPopup(node.id);

    this._lastLocation = index;
  };

  flyTo(lngLat) {
    this._map.flyTo({
      center: lngLat,
      ...getFlyToOptions(),
    });
  }

  _setLocationsToUpdate() {
    this._locations = null;
    if (Array.isArray(this._locations) && this._locations.length > 0) {
      this._totalLocations -= 1;
    }
    if (this._lastLocation > this._totalLocations) {
      this._lastLocation -= 1;
    }
  }

  setEventListeners() {
    this._map.on("mouseenter", "nodes", this._handleMouseEnter);
    this._map.on("mousemove", "nodes", this._handleMouseMove);
    this._map.on("mouseleave", "nodes", this._handleMouseLeave);
    this._map.on("click", "nodes", this._handleClick);
  }

  removeEventListeners() {
    this._map.off("mouseenter", "nodes", this._handleMouseEnter);
    this._map.off("mousemove", "nodes", this._handleMouseMove);
    this._map.off("mouseleave", "nodes", this._handleMouseLeave);
    this._map.off("click", "nodes", this._handleClick);
  }

  setHoverEventListeners() {
    this._map.on("mouseenter", "nodes", this._handleMouseEnter);
    this._map.on("mousemove", "nodes", this._handleMouseMove);
    this._map.on("mouseleave", "nodes", this._handleMouseLeave);
  }

  removeHoverEventListeners() {
    this._map.off("mouseenter", "nodes", this._handleMouseEnter);
    this._map.off("mousemove", "nodes", this._handleMouseMove);
    this._map.off("mouseleave", "nodes", this._handleMouseLeave);
  }

  _handleMouseEnter = () => {
    this._map.getCanvasContainer().style.cursor = "pointer";
  };

  _handleMouseMove = (e) => {
    if (e.features.length > 0) {
      if (this._hoverNodeId) {
        this._map.setFeatureState({ source: "nodes", id: this._hoverNodeId }, { hover: false });
      }
      this._hoverNodeId = e.features[0].id;
      this._map.setFeatureState({ source: "nodes", id: this._hoverNodeId }, { hover: true });
    }
  };

  _handleMouseLeave = () => {
    this._map.getCanvasContainer().style.cursor = "";
    if (this._hoverNodeId) {
      this._map.setFeatureState({ source: "nodes", id: this._hoverNodeId }, { hover: false });
      this._hoverNodeId = null;
    }
  };

  _handleClick = (e) => {
    const nodeId = e.features[0].id;
    const lngLat = e.features[0].geometry.coordinates;

    // disable clicks for other nodes during move mode
    if (this._moving && nodeId != this._movingNodeId) {
      return;
    }

    // unhover node if on mobile to prevent sticking
    if (this._hoverNodeId && isMobile()) {
      this._map.setFeatureState({ source: "nodes", id: this._hoverNodeId }, { hover: false });
    }

    this.setPopup(nodeId, lngLat);
  };

  _onNodeMove = (e) => {
    this._map.getCanvasContainer().style.cursor = "grabbing";

    this._geojson.features[this._index].geometry.coordinates = e.lngLat.toArray();
    this._source.setData(this._geojson);

    if (this._popup) this._popup.setLngLat(e.lngLat);
  };

  _onNodeUp = () => {
    this._map.getCanvasContainer().style.cursor = "move";

    if (this._popup && this._popup.getElement()) {
      this._popup._content.style.pointerEvents = "";
    }

    this._map.off("mousemove", this._onNodeMove);
    this._map.off("touchmove", this._onNodeMove);
  };

  _onNodeDown = (e) => {
    if (e.features[0].id == this._movingNodeId) {
      e.preventDefault();

      if (this._popup && this._popup.getElement()) {
        this._popup._content.style.pointerEvents = "none";
      }

      this._map.on("mousemove", this._onNodeMove);
      this._map.once("mouseup", this._onNodeUp);
    }
  };

  _onNodeTouch = (e) => {
    if (e.points.length !== 1) return;

    e.preventDefault();

    this._map.on("touchmove", this._onNodeMove);
    this._map.once("touchend", this._onNodeUp);
  };

  _onNodeEnter = (e) => {
    if (e.features[0].id == this._movingNodeId) {
      this._map.getCanvasContainer().style.cursor = "move";
      this._map.setFeatureState({ source: "nodes", id: this._movingNodeId }, { hover: true });
    }
  };

  _onNodeLeave = () => {
    this._map.getCanvasContainer().style.cursor = "";
    this._map.setFeatureState({ source: "nodes", id: this._movingNodeId }, { hover: false });
  };

  _handleMoveNodeButton = () => {
    if (this._moving) {
      this._finishMove();
    } else {
      this._setMove();
    }
  };

  _setMove() {
    this._moving = true;
    this._movingNodeId = this._selectedNodeId;

    const node = this._nodes.get(this._movingNodeId);
    const nodeId = this._movingNodeId;

    const footer = this._popup?.getElement()?.querySelector(".popup-buttons");
    const editBtn = footer?.querySelector("#popup-edit-button");
    const deleteBtn = footer?.querySelector("#popup-delete-button");

    if (footer) {
      editBtn.disabled = true;
      deleteBtn.disabled = true;
    }

    this._map.setPaintProperty("nodes", "circle-opacity", ["case", ["==", ["get", "id"], nodeId], 1, 0.3]);
    this._map.setPaintProperty("nodes", "circle-stroke-opacity", ["case", ["==", ["get", "id"], nodeId], 1, 0.3]);

    this.removeHoverEventListeners();

    addBanner(
      "Edit Mode Activated",
      `To move the node click and drag it to desired position then click the
      move button again to save its position or close this banner to cancel.`,
      {
        lock: true,
        close: true,
        closeHandler: () => {
          // reset location of node and popup
          this._geojson.features[this._index].geometry.coordinates = node.lngLat;
          this._source.setData(this._geojson);
          if (this._popup) this._popup.setLngLat(node.lngLat);
          this._handleMoveNodeButton();
        },
      },
    );

    // set index for handlers
    this._index = this._geojson.features.findIndex((n) => n.properties.id == nodeId);

    this._map.on("mouseenter", "nodes", this._onNodeEnter);
    this._map.on("mouseleave", "nodes", this._onNodeLeave);
    this._map.on("mousedown", "nodes", this._onNodeDown);
    this._map.on("touchstart", "nodes", this._onNodeTouch);
  }

  _finishMove() {
    const node = this._nodes.get(this._movingNodeId);
    const nodeId = this._movingNodeId;

    this._moving = false;
    this._movingNodeId = null;

    const footer = this._popup?.getElement()?.querySelector(".popup-buttons");
    const editBtn = footer?.querySelector("#popup-edit-button");
    const deleteBtn = footer?.querySelector("#popup-delete-button");

    removeBanner();

    const currentNodeCoordinates = new maplibregl.LngLat(
      this._geojson.features[this._index].geometry.coordinates[0],
      this._geojson.features[this._index].geometry.coordinates[1],
    );
    const originalNodeCoordinates = new maplibregl.LngLat(
      node.lngLat[0],
      node.lngLat[1],
    );
    if (currentNodeCoordinates.toString() != originalNodeCoordinates.toString()) {
      apiUpdateCoordinates(nodeId, currentNodeCoordinates)
        .then((node) => {
          this.updateNode(nodeId, node);
          addBanner("Success", "Updated node coordinates", {
            color: "#008000",
            close: "true",
            duration: 5000,
            stack: true
          });
        })
        .catch(() => {
          // revert location
          this._geojson.features[this._index].geometry.coordinates = node.lngLat;
          this._source.setData(this._geojson);
          if (this._popup) this._popup.setLngLat(node.lngLat);
        });
    }

    if (footer) {
      editBtn.disabled = false;
      deleteBtn.disabled = false;
    }

    this._map.setPaintProperty("nodes", "circle-opacity", 1);
    this._map.setPaintProperty("nodes", "circle-stroke-opacity", 1);

    this.setHoverEventListeners();

    this._map.off("mouseenter", "nodes", this._onNodeEnter);
    this._map.off("mouseleave", "nodes", this._onNodeLeave);
    this._map.off("mousedown", "nodes", this._onNodeDown);
    this._map.off("touchstart", "nodes", this._onNodeTouch);
  }

  _handleEditNodeButton = () => {
    const node = this._nodes.get(this._selectedNodeId);

    // TODO: store in the class
    const form = document.getElementById("node-form");
    const modal = form.closest(".modal-overlay");
    const submitButton = form.querySelector(".form-button[type='submit']");
    const closeButton = form.querySelector(".form-button[type='button']");

    function setForm() {
      if (node.name != "Anonymous") form.querySelector("input[name='name']").value = node.name;
      if (node.publicKey) form.querySelector("input[name='publicKey']").value = node.publicKey;
      if (node.elevation) form.querySelector("input[name='elevation']").value = node.elevation;
      form.querySelector("select[name='power']").value = node.power;
      form.querySelector("select[name='device']").value = node.device;
      form.querySelector("select[name='protocol']").value = node.protocol;
      form.querySelector(`#${node.protocol}Frequency`).value = node.frequency;
      form.querySelector(`#${node.protocol}Role`).value = node.role;
      form.querySelector(`#${node.protocol}MqttUplink`).checked = node.mqttUplink;
      form.querySelector("input[name='privacy']").checked = node.owner.privacy;

      for (const el of form.querySelectorAll("select, input")) {
        if (el.tomselect) el.tomselect.sync();
      }

      submitButton.disabled = true;
      updateProtocolVisibility();

      form.addEventListener("input", handleChange);
      form.addEventListener("submit", handleSubmit);
      closeButton.addEventListener("click", handleClose);
    }

    function resetForm() {
      form.reset();
      for (const el of form.querySelectorAll("select, input")) {
        if (el.tomselect) el.tomselect.sync();
      }

      submitButton.disabled = false;
      updateProtocolVisibility();

      form.removeEventListener("input", handleChange);
      form.removeEventListener("submit", handleSubmit);
      closeButton.removeEventListener("click", handleClose);
    }

    function openModal() {
      modal.classList.remove("hidden");
    }

    function closeModal() {
      modal.classList.add("hidden");
    }

    // trigger change event so ui unhides itself using js embeded in page html
    function updateProtocolVisibility() {
      const select = form.querySelector("#nodeProtocol")
      select.dispatchEvent(new Event("change"));
    }

    const handleChange = () => {
      const nameInput = form.querySelector("input[name='name']").value;
      const publicKeyInput = form.querySelector("input[name='publicKey']").value || null;
      const elevationValue = parseInt(form.querySelector("input[name='elevation']").value)
      const elevationInput = isNaN(elevationValue) ? null : elevationValue;
      const powerInput = form.querySelector("select[name='power']").value;
      const deviceInput = form.querySelector("select[name='device']").value;
      const protocolInput = form.querySelector("select[name='protocol']").value;
      const frequencyValue = parseFloat(form.querySelector(`#${protocolInput}Frequency`).value)
      const frequencyInput = isNaN(frequencyValue) ? null : frequencyValue;
      const roleInput = form.querySelector(`#${protocolInput}Role`).value;
      const mqttUplinkInput = form.querySelector(`#${protocolInput}MqttUplink`).checked;
      const privacyInput = form.querySelector("input[name='privacy']").checked;

      const noChange = ((node.name == "Anonymous" && nameInput == "") || nameInput == node.name) &&
        publicKeyInput == node.publicKey &&
        elevationInput == node.elevation &&
        powerInput == node.power &&
        deviceInput == node.device &&
        protocolInput == node.protocol &&
        frequencyInput == node.frequency &&
        roleInput == node.role &&
        mqttUplinkInput == node.mqttUplink &&
        privacyInput == node.owner.privacy

      if (noChange) {
        submitButton.disabled = true;
      } else {
        submitButton.disabled = false;
      }
    }

    const handleSubmit = (e) => {
      e.preventDefault();

      let longitude = form.querySelector("input[name='longitude']");
      if (!longitude) {
        longitude = document.createElement("input");
        longitude.type = "hidden";
        longitude.name = "longitude";
        form.appendChild(longitude);
      }
      longitude.value = node.lngLat[0];

      let latitude = form.querySelector("input[name='latitude']");
      if (!latitude) {
        latitude = document.createElement("input");
        latitude.type = "hidden";
        latitude.name = "latitude";
        form.appendChild(latitude);
      }
      latitude.value = node.lngLat[1];

      apiUpdateNode(node.id, form).then((node) => {
        this.updateNode(node.id, node);
        addBanner("Success", "Updated node information", {
          color: "#008000",
          close: true,
          duration: 5000,
          stack: true
        });
      });

      handleClose();
    }

    const handleClose = () => {
      closeModal();
      resetForm();
    }

    setForm();
    openModal();
  };

  _handleDeleteNodeButton = () => {
    const node = this._nodes.get(this._selectedNodeId);

    if (!confirm("Are you sure you want to delete this node?")) {
      return;
    }

    apiDeleteNode(node.id).then(() => {
      this.deleteNode(node.id);
      addBanner("Success", `Removed node '${node.name}'`, {
        color: "#008000",
        duration: 5000,
        close: true,
        stack: true
      });
    });
  };
}
