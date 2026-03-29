const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

import { toBase64 } from "../utils/base64.util";

export const fetchAccProjectsData = async () => {
  try {
    const response = await fetch(`${backendUrl}/acc/projects`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch ACC projects");
    }

    const { data } = await response.json();
    //console.debug("Fetched ACC projects:", data.projects);

    return data;
  } catch (error) {
    console.error("Error fetching ACC projects:", error);
    throw error;
  }
};

export const fetchAccProjectData = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/projects/${accountId}/${projectId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC project data");
    }

    const { data } = await response.json();

    //console.log("Fetched ACC project data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching ACC project data:", error);
    throw error;
  }
};

export const fetchAccFederatedModel = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/datamanagement/${accountId}/${projectId}/federated-model`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC federated model");
    }

    const { data } = await response.json();

    //console.debug("Fetched ACC federated model:", data);

    return data.federatedmodel ? await toBase64(data.federatedmodel) : null;
  } catch (error) {
    console.error("Error fetching ACC federated model:", error);
    throw error;
  }
};

export const fetchAccProjectUsers = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/projects/${accountId}/${projectId}/users`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC project users");
    }

    const { data } = await response.json();

    //console.debug("Fetched ACC project users:", data);

    return data;
  } catch (error) {
    console.error("Error fetching ACC project users:", error);
    throw error;
  }
};

export const fetchAccProjectIssues = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/projects/${accountId}/${projectId}/issues`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC project issues");
    }

    const { data } = await response.json();

    //console.debug("Fetched ACC project issues:", data);

    return data;
  } catch (error) {
    console.error("Error fetching ACC project issues:", error);
    throw error;
  }
};

export const fetchAccProjectRfis = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/projects/${accountId}/${projectId}/rfis`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC project RFIs");
    }

    const { data } = await response.json();

    //console.debug("Fetched ACC project RFIs:", data);

    return data;
  } catch (error) {
    console.error("Error fetching ACC project RFIs:", error);
    throw error;
  }
};

export const fetchAccProjectSubmittals = async (projectId, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/projects/${accountId}/${projectId}/submittals`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC project submittals");
    }

    const { data } = await response.json();

    //console.log("Fetched ACC project submittals:", data);

    return data;
  } catch (error) {
    console.error("Error fetching ACC project submittals:", error);
    throw error;
  }
};

// ─── Assets ──────────────────────────────────────────────────────────────────

/**
 * Obtiene assets enriquecidos con paginación
 * Backend: GET /acc/projects/:accountId/:projectId/assets
 */
export const getAssetsEnriched = async (accountId, projectId, params = {}) => {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.append(k, v);
    });
    const qs = query.toString();
    const response = await fetch(
      `${backendUrl}/acc/projects/${accountId}/${projectId}/assets${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC project assets");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching ACC project assets:", error);
    throw error;
  }
};

/**
 * Obtiene resumen agregado para charts
 * Backend: GET /acc/projects/:accountId/:projectId/assets/summary
 */
export const getAssetsSummary = async (accountId, projectId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/projects/${accountId}/${projectId}/assets/summary`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ACC project assets summary");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching ACC project assets summary:", error);
    throw error;
  }
};
