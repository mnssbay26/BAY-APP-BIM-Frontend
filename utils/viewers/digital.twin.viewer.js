/* global Autodesk */

import "../viewer_extensions/digital.twin.device.sensor.js";
import "../viewer_extensions/digital.twin.room.sensor.js";


const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";


export async function digitalTwinViewer({
  federatedModel,

  projectId,
  extensionOptions,
}) {
  const validFederatedModel =
    typeof federatedModel === "string" ? federatedModel.trim() : "";

  if (!validFederatedModel) {
    window.viewerInitialized = false;
    return;
  }

  const viewerContainer = document.getElementById("BAYDigitalTwinViewer");

  if (!viewerContainer) {
    window.viewerInitialized = false;
    console.warn("Digital Twin viewer container not found.");
    return;
  }

  console.log("extension", extensionOptions);
  console.log("projectId", extensionOptions.projectId);

  const response = await fetch(`${backendUrl}/auth/token`);
  const { data } = await response.json();

  const options = {
    env: "AutodeskProduction",
    api: "derivativeV2",
    accessToken: data.access_token,
  };

  let viewer = new Autodesk.Viewing.GuiViewer3D(viewerContainer);

  Autodesk.Viewing.Initializer(
    options,
    async () => {
      const startCode = viewer.start();

      window.database7DViewer = viewer;

      if (startCode > 0) {
        console.error("Failed to create a Viewer: Error Code: " + startCode);
        return;
      }

      viewer.setSelectionMode(
        Autodesk.Viewing.SelectionMode.MULTIPLE_SELECTION
      );

      const documentId = `urn:${validFederatedModel}`;

      Autodesk.Viewing.Document.load(documentId, async (viewerDocument) => {
        let defaultModel = viewerDocument.getRoot().getDefaultGeometry();
        viewer.loadDocumentNode(viewerDocument, defaultModel);

        await viewer.loadExtension(
          "DataDeviceSensors",
          extensionOptions,
          projectId
        );
  
      });

      
    },
    () => {
      console.error("Fail");
    }
  );
}
