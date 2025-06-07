import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";

export const getUserGroups = () => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) return [];

  try {
    const decoded = jwtDecode(token);
    return decoded.groups || [];
  } catch (error) {
    console.error("Invalid token", error);
    return [];
  }
};

export const getUsername = () => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.username || null;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};