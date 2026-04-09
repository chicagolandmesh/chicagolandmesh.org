import { addBanner } from "./banner.js";
import { capitalize, getHTTPStatusText } from "./utils.js";

export async function apiGetLocations() {
  const response = await apiRequest("GET", "/api/me/locations", {
    errorMessage: "Failed to get node locations",
    errorMessageLength: 10000,
  });
  return await response.json();
}

export async function apiDeleteNode(id) {
  await apiRequest("DELETE", `/api/nodes/${id}`, {
    errorMessage: "Failed to delete node",
    errorMessageLength: 10000,
  });
}

export async function apiCreateNode(form) {
  const data = new FormData(form);

  for (const [key, value] of [...data.entries()]) {
    if (value === "" || value === null) {
      data.delete(key);
    }
  }

  const response = await apiRequest("POST", "/api/nodes", {
    body: new URLSearchParams(data),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    errorMessage: "Failed to create node",
    errorMessageLength: 10000,
  });

  return await response.json();
}

export async function apiCheckAuth() {
  let auth = {
    isAuthenticated: false,
    userId: null,
    expiresAt: null
  };

  try {
    const response = await apiRequest("GET", "/api/me");
    if (response.ok) {
      const data = await response.json();
      auth.isAuthenticated = true;
      auth.userId = data.user.id;
      auth.expiresAt = data.expires_at;
    }
  } catch (error) {
    if (error.status !== 401) {
      console.error(error);
    }
  }

  return auth;
}

export async function apiGetNodes() {
  const response = await apiRequest("GET", "/api/nodes", {
    errorMessage: "Failed getting nodes",
  });
  return await response.json();
}

export async function apiUpdateNode(id, form) {
  const data = new FormData(form);

  for (const [key, value] of [...data.entries()]) {
    if (value === "" || value === null) {
      data.delete(key);
    }
  }

  const response = await apiRequest("PUT", `/api/nodes/${id}`, {
    body: new URLSearchParams(data),
    errorMessage: "Failed to update node",
    errorMessageLength: 10000,
  });

  return await response.json();
}

export async function apiUpdateCoordinates(id, { lng, lat }) {
  const response = await apiRequest("PATCH", `/api/nodes/${id}`, {
    body: JSON.stringify({ longitude: lng, latitude: lat }),
    headers: { "Content-Type": "application/json" },
    errorMessage: "Failed to update coordinates",
    errorMessageLength: 10000,
  });
  return await response.json();
}

export async function apiLogout() {
  await apiRequest("GET", "/api/logout", {
    errorMessage: "Failed to logout",
    errorMessageLength: 5000,
  });
}

async function apiRequest(method, url, options) {
  const { body, headers, errorMessage, errorMessageLength } = options || {};

  try {
    const response = await fetch(url, {
      method,
      body: body,
      headers: { ...headers },
      credentials: "include",
    });

    if (!response.ok) {
      let error = new Error(`Error: ${response.status} ${getHTTPStatusText(response.status)}`);
      error.status = response.status;

      try {
        const data = await response.json();
        error.data = data;
      } catch (_) {}

      throw error;
    }

    return response;
  } catch (error) {
    if (errorMessage) {
      if (error.data?.error) {
        error.message = Object.entries(error.data.errors)
          .map(([key, value]) => capitalize(key) + " " + value)
          .join("<br>");
      }

      addBanner(errorMessage, error.message, {
        duration: errorMessageLength,
        color: "#e54e33",
        close: true,
      });
    }
    throw error;
  }
}
