const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

import { toBase64 } from "../utils/base64.util";

async function fetchBim360(url, fetchLabel){
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch BIM 360 ${fetchLabel}`);
    }

    const { data } = await response.json();
    console.debug(`Fetched BIM 360 ${fetchLabel}:`, data);

    return data;
  } catch (error) {
    console.error(`Error fetching BIM 360 ${fetchLabel}:`, error);
    throw error;
  }

}

export const fetchBim360ProjectsData = async () => {
  return await fetchBim360(`${backendUrl}/bim360/projects`,"projects")
};

export const fetchBim360ProjectData = async (projectId, accountId) => {
  return await fetchBim360(`${backendUrl}/bim360/projects/${accountId}/${projectId}`, "project data")
};

export const fetchBim360FederatedModel = async (projectId, accountId) => {
  const data = await fetchBim360(`${backendUrl}/datamanagement/${accountId}/${projectId}/federated-model`,"federated model")
  return data.federatedModel ? await toBase64(data.federatedModel) : null
};

export const fetchBim360ProjectUsers = async (projectId, accountId) => {
  return await fetchBim360(`${backendUrl}/bim360/projects/${accountId}/${projectId}/users`, "project users")
};

export const fetchBim360ProjectIssues = async (projectId, accountId) => {
  return await fetchBim360(`${backendUrl}/bim360/projects/${accountId}/${projectId}/issues`, "project issues")
};

export const fetchBim360ProjectRfis = async (projectId, accountId) => {
  return await fetchBim360(`${backendUrl}/bim360/projects/${accountId}/${projectId}/rfis`, "project RFIs")
};
