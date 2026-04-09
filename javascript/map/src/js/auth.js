import { apiCheckAuth } from "./api.js";

export let auth = {
  isAuthenticated: false,
  userId: null,
  expiresAt: null
}

export async function setAuth() {
  auth = await apiCheckAuth();
}

export async function removeAuth() {
  auth = {}
}
