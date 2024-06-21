const API_ENDPOINT = "https://chicagolandmesh.org/api";

document.addEventListener("DOMContentLoaded", async function () {
  await apiGetNodes();
  await checkAuthentication();
  updateMapWithNodes();
  attachMarkerEventListeners();
});



// AUTHENTICATION CODE //
let userId = null;
let isUserAuthenticated = null;
async function reCheckAuth() {
  const response = await fetch(`${API_ENDPOINT}/protected`, {
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 401) {
      return;
    } else {
      throw new Error("Could not fetch endpoint");
    }
  } else {
    isUserAuthenticated = true;
    const data = await response.json();
    userId = data.user_id;
    updateButton();
    return true;
  }
}
async function checkAuthentication() {
  if (isUserAuthenticated === null) {
    try {
      const response = await fetch(`${API_ENDPOINT}/protected`, {
        credentials: "include",
      });
      if (!response) {
        throw new Error("No response");
      }
      if (!response.ok) {
        if (response.status === 401) {
          isUserAuthenticated = false;
          return;
        } else {
          throw new Error("Could not fetch endpoint");
        }
      } else {
        const data = await response.json();
        isUserAuthenticated = true;
        userId = data.user_id;
        updateButton();
        return isUserAuthenticated;
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }
  return isUserAuthenticated;
}

function loginEvent() {
    markerData.forEach((marker) => {
      marker.off("mouseover");
      marker.on("mouseover", function () {
        currentMarker = marker;
        currentMarkerInfo = marker.options.info;
        marker.openPopup();
        if (!isUserAuthenticated) {
          reCheckAuth();
        }
        if (isUserAuthenticated) {
          isUserAuthenticated = true;
          updateMapWithNodes();
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          detachMarkerEventListeners();
          attachMarkerEventListeners();
        }
      });
      marker.off("click");
      marker.on("click", function () {
        marker.togglePopup();
        if (!isUserAuthenticated) {
          reCheckAuth();
        }
        if (isUserAuthenticated) {
          isUserAuthenticated = true;
          updateMapWithNodes();
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          detachMarkerEventListeners();
          attachMarkerEventListeners();
        }
      });
    });
  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      if (!isUserAuthenticated) {
        reCheckAuth();
      }
      if (isUserAuthenticated) {
        isUserAuthenticated = true;
        updateMapWithNodes();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
          detachMarkerEventListeners();
          attachMarkerEventListeners();
      }
    }
  }
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function handleLoginClick() {
  function openLoginPage() {
    window.open(`${API_ENDPOINT}/login`, "_blank");
    loginEvent();
  }
  var loginButton = document.getElementById("loginButton");
  if (loginButton) {
    loginButton.addEventListener("click", openLoginPage);
  }
}
document.addEventListener("DOMContentLoaded", handleLoginClick);



// MODAL CODE //
function updateButton() {
  var elementsWithId = document.querySelectorAll("[id]");
  try {
    elementsWithId.forEach(function (element) {
      if (element.id === "submitButton") {
        if (isUserAuthenticated) {
          element.disabled = false;
          element.style.opacity = 1;
          element.style.pointerEvents = "auto";
        } else {
          element.disabled = true;
          element.style.opacity = 0.5;
          element.style.pointerEvents = "none";
        }
      } else if (element.id === "loginButton") {
        if (isUserAuthenticated) {
          element.disabled = true;
          element.style.opacity = 0.5;
          element.style.pointerEvents = "none";
        } else {
          element.disabled = false;
          element.style.opacity = 1;
          element.style.pointerEvents = "auto";
        }
      }
    });
  } catch (error) {
    console.error("Error updating buttons:", error);
  }
}

function openModal() {
  document.getElementById("nodeModal").style.display = "block";
}

function closeModal() {
  document.getElementById("nodeModal").style.display = "none";
}

function openEditModal() {
  // fill in form with current node information
  document.getElementById("editModal").style.display = "block";
  document.getElementById("editTitle").value = currentMarkerInfo.name;
  document.getElementById("editRole").value = currentMarkerInfo.role;
  document.getElementById("editElevation").value = currentMarkerInfo.elevation
    ? currentMarkerInfo.elevation
    : null;
  document.getElementById("editElevationUnit").value = currentMarkerInfo.elevation_unit 
    ? currentMarkerInfo.elevation_unit 
    : "ft";
  document.getElementById("editFrequency").value = currentMarkerInfo.frequency;
  document.getElementById("editMQTT").value = currentMarkerInfo.mqtt;
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

function openDeleteModal() {
  document.getElementById("deleteModal").style.display = "block";
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
}



// MAP CODE //
var mapElement = document.getElementById("osm-map");
mapElement.style = "height:100%;width:100%;";

var map = L.map(mapElement, {
  zoomControl: false,
});
map.getPane("mapPane").style.zIndex = 1;
map.getPane("tilePane").style.zIndex = -90;
map.getPane("overlayPane").style.zIndex = -80;
map.getPane("shadowPane").style.zIndex = -70;
map.getPane("markerPane").style.zIndex = -60;
map.getPane("tooltipPane").style.zIndex = -50;
map.getPane("popupPane").style.zIndex = -40;

L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
}).addTo(map);

L.control
  .zoom({
    position: "topleft",
  })
  .addTo(map);
document.querySelector(".leaflet-top.leaflet-left").style.zIndex = 1;
document.querySelector(".leaflet-top.leaflet-right").style.zIndex = 1;
document.querySelector(".leaflet-bottom.leaflet-left").style.zIndex = 1;
document.querySelector(".leaflet-bottom.leaflet-right").style.zIndex = 1;

var target = L.latLng("41.83912", "-87.75288");

map.setView(target, 10);

var latitude;
var longitude;
function handleMapClick(e) {
  latitude = e.latlng.lat;
  longitude = e.latlng.lng;
  openModal();
}
map.on("click", handleMapClick);

var iconMapping = {
  fixed: L.icon({
    iconUrl: "../assets/images/map-marker-red.svg",
    iconSize: [36, 36],
    iconAnchor: [18, 35],
    popupAnchor: [-1, -20],
  }),
  portable: L.icon({
    iconUrl: "../assets/images/map-marker-blue.svg",
    iconSize: [36, 36],
    iconAnchor: [18, 35],
    popupAnchor: [-1, -20],
  }),
  router: L.icon({
    iconUrl: "../assets/images/map-marker-green.svg",
    iconSize: [36, 36],
    iconAnchor: [18, 35],
    popupAnchor: [-1, -20],
  }),
  repeater: L.icon({
    iconUrl: "../assets/images/map-marker-orange.svg",
    iconSize: [36, 36],
    iconAnchor: [18, 35],
    popupAnchor: [-1, -20],
  }),
};



// API CODE //
async function apiLogout() {
  try {
    const response = await fetch(`${API_ENDPOINT}/logout`);
    if (!response.ok) {
      const responseBodyText = await response.text();
      let errorMessage = `${response.status} ${response.statusText} ${responseBodyText}`;
      throw new Error(errorMessage);
    }

    const { ok, status, statusText } = response;
    const { errors, message } = await response.json();
    //sendNotification(`${status} ${statusText}`, message, status);
    isUserAuthenticated = false;
    updateMapWithNodes();
  } catch (error) {
    console.log(error);
  }
}

var nodeData = [];
async function apiGetNodes() {
  try {
    const response = await fetch(`${API_ENDPOINT}/nodes`);
    if (!response.ok) {
      const responseBodyText = await response.text();
      let errorMessage = `${response.status} ${response.statusText} ${responseBodyText}`;
      throw new Error(errorMessage);
    }
    nodeData = await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function apiGetUsers() {
  try {
    const response = await fetch(`${API_ENDPOINT}/users`);
    if (!response.ok) {
      throw new Error(response);
    }
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function apiPutUserPrivacy(privacy) {
  try {
    const response = await fetch(`${API_ENDPOINT}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"privacy": privacy})
    });
    return response;
  } catch (error) {
    console.log(error);
  }
}

async function apiPostNode(postData) {
  try {
    const {
      name,
      role,
      latitude,
      longitude,
      elevation,
      elevation_unit,
      frequency,
      mqtt,
    } = postData;

    const response = await fetch(`${API_ENDPOINT}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        role: role,
        latitude: latitude,
        longitude: longitude,
        elevation: elevation,
        elevation_unit: elevation_unit,
        frequency: frequency,
        mqtt: mqtt,
      }),
      credentials: "include",
    });

    const { ok, status, statusText } = response;
    const { errors, node, message } = await response.json();

    // throw error and notification if exists
    if (!response.ok || !node) {
      if (errors) {
        console.error("Server sent errors:", errors);
      }
      const errorMessage = errors
        ? errors.map((error) => error.msg).join("<br>")
        : `${status} ${statusText}`;
      //sendNotification(`${status} ${statusText}`, errorMessage, status);
      throw new Error("Request failed or returned empty response.");
    }

    //sendNotification(`${status} ${statusText}`, message, status);
    return node;
  } catch (error) {
    console.error(error);
  }
}

async function apiPutNode(putData) {
  try {
    var {
      uuid,
      name,
      role,
      latitude,
      longitude,
      elevation,
      elevation_unit,
      frequency,
      mqtt,
    } = putData;

    function compareAndSelect(oldVariable, newVariable) {
      if (
        newVariable === "" ||
        newVariable === null ||
        newVariable === undefined
      ) {
        return oldVariable;
      } else if (newVariable !== oldVariable) {
        return newVariable;
      } else {
        return newVariable;
      }
    }

    var uuid = compareAndSelect(currentMarkerInfo.uuid, uuid);
    var name = compareAndSelect(currentMarkerInfo.name, name);
    var role = compareAndSelect(currentMarkerInfo.role, role);
    var latitude = compareAndSelect(currentMarkerInfo.latitude, latitude);
    var longitude = compareAndSelect(currentMarkerInfo.longitude, longitude);
    var elevation = compareAndSelect(currentMarkerInfo.elevation, elevation);
    var elevation_unit = compareAndSelect(
      currentMarkerInfo.elevation_unit,
      elevation_unit
    );
    var frequency = compareAndSelect(currentMarkerInfo.frequency, frequency);
    var mqtt = compareAndSelect(currentMarkerInfo.mqtt, mqtt);

    // query endpoint and pull data
    const response = await fetch(`${API_ENDPOINT}/nodes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid,
        name,
        role,
        latitude,
        longitude,
        elevation,
        elevation_unit,
        frequency,
        mqtt,
      }),
      credentials: "include",
    });
    const { ok, status, statusText } = response;
    const { errors, message } = await response.json();

    // throw error and notification if exists
    if (!ok) {
      if (errors) {
        console.error("Server sent errors:", errors);
      }
      const errorMessage = errors
        ? errors.map((error) => error.msg).join("<br>")
        : `${status} ${statusText}`;
      //sendNotification(`${status} ${statusText}`, errorMessage, status);
      throw new Error("Request failed or returned empty response.");
    }

    // send success notification and return node data
    //sendNotification(`${status} ${statusText}`, message, status);
    return message;
  } catch (error) {
    console.error(error);
  }
}

async function apiDeleteNode(deleteData) {
  try {
    const uuid = deleteData;

    const response = await fetch(`${API_ENDPOINT}/nodes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid }),
      credentials: "include",
    });
    const { ok, status, statusText } = response;
    const { errors, node, message } = await response.json();

    // throw error and notification if exists
    if (!ok) {
      if (errors) {
        console.error("Server sent errors:", errors);
      }
      const errorMessage = errors
        ? errors.map((error) => error.msg).join("<br>")
        : `${status} ${statusText}`;
      //sendNotification(`${status} ${statusText}`, errorMessage, status);
      throw new Error("Request failed or returned empty response.");
    }

    //sendNotification(`${status} ${statusText}`, message, status);
    return message;
  } catch (error) {
    console.error(error);
  }
}



// MARKER CODE //
var markerData = [];
var currentMarker;
var currentMarkerInfo;
async function updateMapWithNodes() {
  try {
    detachMarkerEventListeners();

    // remove all markers
    markerData.forEach((marker) => {
      map.removeLayer(marker);
    });

    // reset marker data
    markerData = [];

    const usernames = await apiGetUsers();

    // create new markers and marker data
    nodeData.forEach((node) => {
      var user = usernames.find(u => u.user_id === node.user_id);
      var username = user.global_name;
      if (!user) {
        username = 'hidden';
      }
      const {
        uuid,
        user_id,
        name,
        role,
        latitude,
        longitude,
        elevation,
        elevation_unit,
        frequency,
        mqtt,
        createdAt,
      } = node;
      const marker = L.marker([latitude, longitude], {
        icon: iconMapping[role],
        info: {
          uuid,
          user_id,
          name,
          username,
          role,
          latitude,
          longitude,
          elevation,
          elevation_unit,
          frequency,
          mqtt,
          createdAt
        },
      }).addTo(map);

      updateNodeContent(marker);

      markerData.push(marker);
    });

    attachMarkerEventListeners();
  } catch (error) {
    console.error(error);
  }
}

function attachMarkerEventListeners() {
  markerData.forEach((marker) => {
    marker.on("mouseover", function () {
      currentMarker = marker;
      currentMarkerInfo = marker.options.info;
      marker.openPopup();
    });
    marker.off("click");
    marker.on("click", function () {
      marker.togglePopup();
    });
  });
}
function detachMarkerEventListeners() {
  markerData.forEach((marker) => {
    marker.off("mouseover");
    marker.off("click");
  });
}

async function toggleMarkerDragging() {
  const selectedMarker = currentMarker;
  const selectedMarkerInfo = currentMarkerInfo;

  var buttonsDisabled;

  function updateButtonState() {
    const deleteButton = document.getElementById("popup-delete-button");
    const editButton = document.getElementById("popup-edit-button");
    const dragButton = document.getElementById("popup-drag-button");

    if (buttonsDisabled) {
      deleteButton.classList.add("button-disabled");
      deleteButton.disabled = true;
      editButton.classList.add("button-disabled");
      editButton.disabled = true;
      dragButton.classList.add("popup-edit-button-enabled");
      editButton.classList.remove("shake");
      deleteButton.classList.remove("shake");
    } else {
      deleteButton.classList.remove("button-disabled");
      deleteButton.disabled = false;
      editButton.classList.remove("button-disabled");
      editButton.disabled = false;
      dragButton.classList.remove("popup-edit-button-enabled");
      editButton.classList.add("shake");
      deleteButton.classList.add("shake");
      document.getElementById("drag-box").style.display = "none";
    }
  }

  try {
    if (selectedMarker.dragging.enabled()) {
      // disable dragging
      selectedMarker.dragging.disable();

      // disable ui elements
      buttonsDisabled = false;
      updateButtonState();

      // disable marker opacity
      markerData.forEach((marker) => {
        if (marker != currentMarker) {
          marker.setOpacity(1);
        }
      });

      // re-enable map clicks
      map.on("click", handleMapClick);

      // remove event listeners and reattach default ones
      selectedMarker.off("click");
      selectedMarker.off("popupopen");
      selectedMarker.off("dragend");
      attachMarkerEventListeners();

      // grab new cords exit if position not changed
      var updatedCords = selectedMarker.getLatLng();
      const latitude = updatedCords.lat;
      const longitude = updatedCords.lng;
      if (
        selectedMarkerInfo.latitude === latitude &&
        selectedMarkerInfo.longitude === longitude
      ) {
        return;
      }

      // push cords to api and grab response
      const putData = { latitude, longitude };
      result = await apiPutNode(putData);
      const { ok, status, statusText } = result;
      const { errors, node, message } = await result.json();

      // throw errors and error notification if exists
      if (errors) {
        const body = errors.map((error) => error.msg).join("<br>");
        console.error("Server sent errors: ", errors);
        //sendNotification(`${status} ${statusText}`, body, status);
        throw new Error("Request failed or returned empty response.");
      }
      if (!ok) {
        const body = errors.map((error) => error.msg).join("<br>");
        console.error("Server sent errors: ", errors);
        //sendNotification(`${status} ${statusText}`, body, status);
        throw new Error("Request failed or returned empty response.");
      }

      // push cords to local node list
      const index = nodeData.findIndex(
        (item) => item.uuid === selectedMarkerInfo.uuid
      );
      if (index !== -1) {
        nodeData[index].latitude = latitude;
        nodeData[index].longitude = longitude;
      } else {
        console.error("Node not found: ", error);
      }

      // send success status notification
      //sendNotification(`${status} ${statusText}`, message, status);
    } else {
      // enable dragging
      selectedMarker.dragging.enable();

      // set ui elements
      document.getElementById("drag-box").style.display = "flex";
      buttonsDisabled = true;
      updateButtonState();

      // enable marker opacity
      markerData.forEach((marker) => {
        if (marker != currentMarker) {
          marker.setOpacity(0.5);
        }
      });

      // disable map clicks
      map.off("click");

      // deatach default marker event listerns and enable the following
      detachMarkerEventListeners();
      selectedMarker.on("click", function () {
        selectedMarker.togglePopup();
      });
      selectedMarker.on("popupopen", function () {
        updateButtonState();
      });
      selectedMarker.on("dragend", function () {
        selectedMarker.openPopup();
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function submitNode() {
  try {
    // grab values from form
    const name = document.getElementById("nodeTitle").value || "Anonymous";
    const role = document.getElementById("nodeRole").value;
    const elevation = parseInt(document.getElementById("nodeElevation").value)
      ? parseInt(document.getElementById("nodeElevation").value)
      : null;
    const elevation_unit = document.getElementById("nodeElevation").value
      ? document.getElementById("elevationUnit").value
      : null;
    const frequency = parseInt(document.getElementById("nodeFrequency").value);
    const mqtt = document.getElementById("nodeMQTT").value;

    const privacy = document.getElementById("usernamePrivacy").checked;

    // send and recieve api data
    const postData = {
      name,
      role,
      latitude,
      longitude,
      elevation,
      elevation_unit,
      frequency,
      mqtt,
    };
    const node = await apiPostNode(postData);
    if (!node) {
      throw new Error("Node data is missing");
    }

    await apiPutUserPrivacy(privacy);

    // add response to map
    nodeData.push(node);
    updateMapWithNodes();

    // close modal and send notification
    closeModal();
    document.getElementById("nodeForm").reset();
  } catch (error) {
    console.error("Failed to submit node:", error);
  }
}

async function editNode() {
  try {
    // grab new node data from form
    const uuid = currentMarkerInfo.uuid;
    const name = document.getElementById("editTitle").value || "Anonymous";
    const role = document.getElementById("editRole").value;
    const latitude = currentMarkerInfo.latitude;
    const longitude = currentMarkerInfo.longitude;
    const elevation = parseInt(document.getElementById("editElevation").value);
    const elevation_unit = nodeElevation
      ? document.getElementById("editElevationUnit").value
      : "";
    const frequency = parseInt(document.getElementById("editFrequency").value);
    const mqtt = document.getElementById("editMQTT").value;

    const privacy = document.getElementById("editUsernamePrivacy").checked;

    // submit new data to api
    const putData = {
      uuid,
      name,
      role,
      latitude,
      longitude,
      elevation,
      elevation_unit,
      frequency,
      mqtt,
    };

    await apiPutUserPrivacy(privacy);
    const node = await apiPutNode(putData);
    if (!node) {
      throw new Error("Node data is missing or duplicate entry");
    }

    // update popup with new data
    updatedNode = {
      uuid: uuid,
      user_id: userId,
      name: name,
      role: role,
      latitude: currentMarkerInfo.latitude,
      longitude: currentMarkerInfo.longitude,
      elevation: elevation,
      elevation_unit: elevation_unit,
      frequency: frequency,
      mqtt: mqtt,
      createdAt: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium' }),
    };

    const index = nodeData.findIndex((item) => item.uuid === uuid);
    if (index !== -1) {
      nodeData[index] = updatedNode;
    } else {
      console.error("Node not found: ", error);
    }

    updateMapWithNodes();
    currentMarker.openPopup();

    // close modal
    closeEditModal();
    document.getElementById("editForm").reset();
  } catch (error) {
    console.error(error);
  }
}

async function deleteNode() {
  try {
    const uuid = currentMarkerInfo.uuid;
    const result = await apiDeleteNode(uuid);
    if (!result) {
      throw new Error("No deletion response");
    }
    map.removeLayer(currentMarker);
    closeDeleteModal();
  } catch (error) {
    console.error(error);
  }
}

function updateNodeContent(marker) {
  const { name, username, user_id, role, elevation, elevation_unit, frequency, mqtt, createdAt } = marker.options.info;
  const owner = `Owner: ${username}<br>`;

  const authPopup =
    `<div>
        <div style="display:flex;justify-content:space-between;margin: 13px 24px 3px 20px;word-wrap:break-word;">
            <b style="overflow:auto;">${name}</b>
        </div>
        <div style="margin: 13px 24px 13px 20px;">
            ${owner}
            Role:  ${role}<br>
            Elevation:  ${elevation || "not set"} ${elevation_unit}<br>
            Frequency:  ${frequency} MHz<br>
            MQTT root topic:  ${mqtt}<br>
          <br>
          <i style="font-size:medium">Created on ${createdAt}</i>
        </div>
        <hr style='margin:0 0 0.5em 0;border-bottom:0.05rem solid var(--md-default-fg-color);'>
        <div class="popup-buttons">
            <button id="popup-drag-button" class="popup-button shake" onclick="toggleMarkerDragging()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M22.67,12L18.18,16.5L15.67,14L17.65,12L15.67,10.04L18.18,7.53L22.67,12M12,1.33L16.47,5.82L13.96,8.33L12,6.35L10,8.33L7.5,5.82L12,1.33M12,22.67L7.53,18.18L10.04,15.67L12,17.65L14,15.67L16.5,18.18L12,22.67M1.33,12L5.82,7.5L8.33,10L6.35,12L8.33,13.96L5.82,16.47L1.33,12M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z" />
                </svg>
            </button>
            <button id="popup-edit-button" class="popup-button shake" onclick="openEditModal()">
                <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H10V20.1L20 10.1V8L14 2H6M13 3.5L18.5 9H13V3.5M20.1 13C20 13 19.8 13.1 19.7 13.2L18.7 14.2L20.8 16.3L21.8 15.3C22 15.1 22 14.7 21.8 14.5L20.5 13.2C20.4 13.1 20.3 13 20.1 13M18.1 14.8L12 20.9V23H14.1L20.2 16.9L18.1 14.8Z" />
                </svg>
            </button>
            <button id="popup-delete-button" class="popup-button shake" onclick="openDeleteModal()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M9,8H11V17H9V8M13,8H15V17H13V8Z" />
                </svg>
            </button>
            <div style="display: inline-flex; align-items: center">
              <button class="popup-button shake" onclick="apiLogout()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>logout</title><path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12M4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" /></svg>
              </button>
            </div>
        </div>
    </div>`;

  let unauthPopup =
    `<div>
        <div style="display:flex;justify-content:space-between;margin: 13px 24px 3px 20px;word-wrap:break-word;">
          <b style="overflow:auto;">${name}</b>
        </div>
        <div style="margin: 13px 24px 13px 20px;">
          ${owner}
          Role:  ${role}<br>
          Elevation:  ${elevation || "not set"} ${elevation_unit}<br>
          Frequency:  ${frequency} MHz<br>
          MQTT root topic:  ${mqtt}<br>
          <br>
          <i style="font-size:medium">Created on ${createdAt}</i>
        </div>
    </div>`;

  let defaultPopup =
    `<div>
        <div style="display:flex;justify-content:space-between;margin: 13px 24px 3px 20px;word-wrap:break-word;">
          <b style="overflow:auto;">${name}</b>
        </div>
        <div style="margin: 13px 24px 13px 20px;">
          Role:  ${role}<br>
          Elevation:  ${elevation || "not set"} ${elevation_unit}<br>
          Frequency:  ${frequency} MHz<br>
          MQTT root topic:  ${mqtt}<br>
          <br>
          <i style="font-size:medium">Created on ${createdAt}</i>
        </div>
        <hr style='margin:0 0 0.5em 0;border-bottom:0.05rem solid var(--md-default-fg-color);'>
        <div style="margin: 13px;">
          <i>Your node? <button onclick="loginEvent()"><a href="${API_ENDPOINT}/login" target="_blank">Login</a></button> to edit</i>
        </div>
    </div>`;

  const options = { closeButton: false, maxWidth: 220 };

  if (isUserAuthenticated) {
    if (marker.options.info.user_id === userId) {
      marker.bindPopup(authPopup, options);
    } else {
      marker.bindPopup(unauthPopup, options);
    }
  } else {
    marker.bindPopup(defaultPopup, options);
  }
}



// ALERT CODE //
// fix later
/*
let notificationClosed = false;
function sendNotification(title, body, status) {

  var container = document.querySelector(".notification-container");

  var messageBox = document.createElement("div");
  messageBox.className = "message-box";
  messageBox.onclick = closeNotification;
  
  var messageContent = document.createElement("div");
  messageContent.className = "message-content";
  
  var titleElement = document.createElement("h2");
  var bold = document.createElement("b");
  bold.innerHTML = title; // Set title as HTML
  
  var bodyElement = document.createElement("p");
  bodyElement.innerHTML = body; // Set body as HTML
  
  messageContent.appendChild(titleElement);
  titleElement.appendChild(bold);
  messageContent.appendChild(bodyElement);
  
  messageBox.appendChild(messageContent);
  
  container.appendChild(messageBox);
  


  var boxStatus;
  var boxAnimation;

  messageBox.className = "message-box";

  if (status >= 200 && status < 300) {
    boxStatus = "success";
    boxAnimation = "open";
  } else if (status >= 400 && status < 600) {
    boxStatus = "error";
    boxAnimation = "shake";
  }

  //messageTitle.innerHTML = title;
  //messageBody.innerHTML = body;

  messageBox.style.display = 'flex';
  messageBox.classList.add(boxStatus);
  messageBox.classList.add(boxAnimation);

  setTimeout(() => {
    messageBox.classList.remove(boxAnimation);
  }, 500);

  if (status >= 200 && status < 300) {
    setTimeout(() => {
      closeNotification();
    }, 2000);
    //notificationClosed = true;
    setTimeout(() => {
      //notificationClosed = false;
      messageBox.style.display = 'none';
      messageBox.classList.add("close-animation");
    }, 6000);
  } else {
    setTimeout(() => {
      messageBox.style.display = 'none';
    }, 2000);
  }
}

function closeNotification() {
  var messageBox = document.getElementsByClassName("message-box");
  messageBox.classList.add("close-animation");

  setTimeout(() => {
    messageBox.style.display = "none";
  }, 500);
}
*/