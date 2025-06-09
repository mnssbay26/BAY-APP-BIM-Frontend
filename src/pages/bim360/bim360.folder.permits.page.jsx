import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";
import FolderPermissionsTable from "@/components/folders_components/folder.permissions.table.jsx";

import {
  fetchBim360ProjectData,
} from "../../pages/services/bim360.services.js";

const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

const Bim360FolderPermitsPage = () => {
    const { projectId, accountId } = useParams();
      const [cookies] = useState(document.cookie);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
    
      const [folders, setFolders] = useState([]);
      const [projectUsers, setProjectUsers] = useState([]);
      const [foldersPermissions, setFoldersPermissions] = useState([]);
      const [folderEnrichedPermissions, setFolderEnrichedPermissions] = useState(
        []
      );
      const [flattenedPermissions, setFlattenedPermissions] = useState([]);
      const [projectData, setProjectData] = useState(null);

      useEffect(() => {
            setLoading(true);
            setError(null);
            Promise.all([
              fetchBim360ProjectData(projectId, accountId),
            ])
              .then(([projectData]) => {
                if (projectData) {
                  setProjectData(projectData);
                }
        
              })
              .catch((error) => {
                console.error("Error fetching issues:", error);
                setError("Failed to load issues. Please try again later.");
              })
              .finally(() => {
                setLoading(false);
              });
          }, [projectId, accountId, cookies]);

          useEffect(() => {
              (async () => {
                try {
                  const res = await fetch(
                    `${BACKEND_BASE_URL}/datamanagement/${accountId}/${projectId}/folders-permissions`,
                    { credentials: "include" }
                  );
                  if (!res.ok) throw new Error(res.statusText);
                  const { data } = await res.json();
                  setFolders(data.folders);
                  setProjectUsers(data.users);
                  setFoldersPermissions(data.permissions);
                  setFolderEnrichedPermissions(data.enrichedPermissions);
                  setFlattenedPermissions(data.flattenFolderPermissions);
                } catch (err) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              })();
            }, [accountId, projectId]);
            
 return (
     <BayerBim360MainLayout projectId={projectId} accountId={accountId}>
      {loading && <BayerLoadingOverlay />}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <>
          <h1 className="text-2xl text-right font-bold mb-1 text-gray-800">
            Project Folders Permits Report
          </h1>
          <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
            {projectData.name}
          </h2>

          <hr className="my-4 border-t border-gray-300" />

          <FolderPermissionsTable
            folders={folders}
            flattenedPermissions={flattenedPermissions}
          />
        </>
      )}
    </BayerBim360MainLayout>
  );
};

export default React.memo(Bim360FolderPermitsPage);