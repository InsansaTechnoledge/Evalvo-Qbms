import axios from "axios";

const PRODUCTION_SERVERS = [
    
  "https://backend.evalvotech.com/api"
  
];

let currentServerIndex = 0;

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8000/api";
  }
  
  return PRODUCTION_SERVERS[currentServerIndex];
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isServerError = error.response?.status >= 500 || !error.response;
    const isProduction =
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1";
    const hasMoreServers = currentServerIndex < PRODUCTION_SERVERS.length - 1;

    if (
      isServerError &&
      isProduction &&
      hasMoreServers &&
      !originalRequest._retry
    ) {
      console.warn(
        `Server ${PRODUCTION_SERVERS[currentServerIndex]} failed, switching to backup...`
      );

      currentServerIndex++;
      const newBaseURL = PRODUCTION_SERVERS[currentServerIndex];

      api.defaults.baseURL = newBaseURL;

      originalRequest._retry = true;
      originalRequest.baseURL = newBaseURL;

      console.log(`Retrying request with server: ${newBaseURL}`);

      return api(originalRequest);
    }

    if (error.response) {

      const { status, data } = error.response;

      console.error(`[API Error ${status}]`, data?.message || error.message);

      switch (status) {
        case 400:
          console.warn("Bad Request:", data?.message);
          break;
        case 403:
          console.warn(":", data?.message);
          break;
        case 404:
          console.warn("Not Found:", data?.message);
          break;
        case 500:
          console.error("Server Error:", data?.message);
          break;
        case 509:
          console.warn("Conflict:", data?.message);
          break;
        default:
          console.warn("Unhandled Error:", data?.message);
      }
    } else if (error.request) {
      console.error("No response received from server:", error.message);
    } else {
      console.error("API Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
