/* global Autodesk */

const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

export const generalViewer = async (urn) => {
  if (!urn) {
    throw new Error("URN is required to initialize the viewer");
  }

  //console.log ("URN:", urn);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/token`);

    if (!response.ok) {
      throw new Error("Failed to fetch authentication token");
    }

    const { data } = await response.json();

    const options = {
      env: "AutodeskProduction",
      api: "modelDerivativeV2",
      accessToken: data.access_token,
    };

    const container = document.getElementById("generalViewerContainer");
    if (!container) {
      throw new Error("Viewer container not found");
    }

    Autodesk.Viewing.Initializer(options, () => {
      const viewer = new Autodesk.Viewing.GuiViewer3D(container);
      if (viewer.start() !== 0) {
        console.error("Failed to start viewer");
        return;
      }
      Autodesk.Viewing.Document.load(
        `urn:${urn}`,
        (doc) => {
          const geom = doc.getRoot().getDefaultGeometry();
          viewer.loadDocumentNode(doc, geom);
        },
        (code, msg) => console.error("Error loading doc:", code, msg)
      );
    });
    
  } catch (error) {
    console.error("Error initializing Autodesk Viewer:", error);
    throw error;
  }
};
