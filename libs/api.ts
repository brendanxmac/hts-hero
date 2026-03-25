import axios from "axios";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";
import config from "@/config";

const isTestEnv = process.env.APP_ENV === "test";
const apiClient = axios.create({
  baseURL: isTestEnv ? "http://localhost:3000/api" : "/api",
});

apiClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    let message = "";

    if (error.response?.status === 401) {
      // Don't redirect on /classifications — anonymous users are allowed there
      const isClassificationsPage =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/classifications");

      if (!isClassificationsPage) {
        toast.error("Please Sign In");
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const redirectParam =
            currentPath !== "/"
              ? `?redirect=${encodeURIComponent(currentPath)}`
              : "";
          window.location.href = config.auth.loginUrl + redirectParam;
        } else {
          redirect(config.auth.loginUrl);
        }
      }
    } else if (error.response?.status === 403) {
      // User not authorized, must subscribe/purchase/pick a plan
      message = "Pick a plan to use this feature";
    } else {
      message =
        error?.response?.data?.error || error.message || error.toString();
    }

    error.message =
      typeof message === "string" ? message : JSON.stringify(message);

    console.error(error.message);

    // Automatically display errors to the user
    if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("something went wrong...");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
