const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

import { toBase64 } from "../utils/base64.util";

export const fetchBim360ProjectsData = async () => {
  try {
    const response = await fetch(`${backendUrl}/bim360/projects`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch BIM 360 projects");
    }

    const { data } = await response.json();
    console.debug("Fetched BIM 360 projects:", data);

    return data;
  } catch (error) {
    console.error("Error fetching BIM 360 projects:", error);
    throw error;
  }
};

export const fetchBim360ProjectData = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/projects/${accountId}/${projectId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch BIM 360 project data");
    }

    const { data } = await response.json();

    console.log("Fetched BIM 360 project data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching BIM 360 project data:", error);
    throw error;
  }
};

export const fetchBim360FederatedModel = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/datamanagement/${accountId}/${projectId}/federated-model`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch BIM 360 federated model");
    }

    const { data } = await response.json();

    console.debug("Fetched BIM 360 federated model:", data);

    return data.federatedmodel ? await toBase64(data.federatedmodel) : null;
  } catch (error) {
    console.error("Error fetching BIM 360 federated model:", error);
    throw error;
  }
};

export const fetchBim360ProjectUsers = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/projects/${accountId}/${projectId}/users`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch BIM 360 project users");
    }

    const { data } = await response.json();

    console.debug("Fetched BIM 360 project users:", data);

    return data;
  } catch (error) {
    console.error("Error fetching BIM 360 project users:", error);
    throw error;
  }
};

export const fetchBim360ProjectIssues = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/projects/${accountId}/${projectId}/issues`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch BIM 360 project issues");
    }

    const { data } = await response.json();

    console.debug("Fetched BIM 360 project issues:", data);

    return data;
  } catch (error) {
    console.error("Error fetching BIM 360 project issues:", error);
    throw error;
  }
};

export const fetchBim360ProjectRfis = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/projects/${accountId}/${projectId}/rfis`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch BIM 360 project RFIs");
    }

    const { data } = await response.json();

    console.debug("Fetched BIM 360 project RFIs:", data);

    return data;
  } catch (error) {
    console.error("Error fetching BIM 360 project RFIs:", error);
    throw error;
  }
};
