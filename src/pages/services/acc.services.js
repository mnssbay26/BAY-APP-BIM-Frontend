const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

import { toBase64 } from "../utils/base64.util";

async function fetchAcc(url, fetchLabel) {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ACC ${fetchLabel}`);
    }

    const { data } = await response.json();
    console.debug(`Fetched ACC ${fetchLabel}:`, data);

    return data;
  } catch (error) {
    console.error(`Error fetching ACC ${fetchLabel}:`, error);
    throw error;
  }
}

export const fetchAccProjectsData = async () => {
  return await fetchAcc(`${backendUrl}/acc/projects`, "projects");
};

export const fetchAccProjectData = async (projectId, accountId) => {
  return await fetchAcc(`${backendUrl}/acc/projects/${accountId}/${projectId}`, "project data");
};

export const fetchAccFederatedModel = async (projectId, accountId) => {
  const data = await fetchAcc(`${backendUrl}/datamanagement/${accountId}/${projectId}/federated-model`, "federated model");
  return data.federatedmodel ? await toBase64(data.federatedmodel) : null;
};

export const fetchAccProjectUsers = async (projectId, accountId) => {
  return await fetchAcc(`${backendUrl}/acc/projects/${accountId}/${projectId}/users`, "project users");
};

export const fetchAccProjectIssues = async (projectId, accountId) => {
  return await fetchAcc(`${backendUrl}/acc/projects/${accountId}/${projectId}/issues`, "project issues");
};

export const fetchAccProjectRfis = async (projectId, accountId) => {
  return await fetchAcc(`${backendUrl}/acc/projects/${accountId}/${projectId}/rfis`, "project RFIs");
};

export const fetchAccProjectSubmittals = async (projectId, accountId) => {
  return await fetchAcc(`${backendUrl}/acc/projects/${accountId}/${projectId}/submittals`, "project submittals");
};