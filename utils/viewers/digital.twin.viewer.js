/* global Autodesk */

import "../viewer_extensions/digital.twin.device.sensor.js";
import "../viewer_extensions/digital.twin.room.sensor.js";

export async function initviewer  ({
  urn,
  accessToken,
  setSelectionCount,
  setSelection,
  setCategoryData,
  setIsLoadingTree,
  projectId,
  extensionOptions})  { 

    console.log("extension", extensionOptions)
    
    console.log("projectId", extensionOptions.projectId);

    const options = {
        env: "AutodeskProduction",
        api: 'derivativeV2',
        accessToken,
      }

      const config = {

        extensions : [ 'DataRoomSensors' ]
    }

    const viewerContainer = document.getElementById('BAYDatabase7dViewer')
    let viewer = new Autodesk.Viewing.GuiViewer3D(viewerContainer, config)

    Autodesk.Viewing.Initializer(options, async () => {
        const startCode = viewer.start()
    
        window.database7DViewer = viewer
        
        if (startCode > 0) {
          console.error('Failed to create a Viewer: Error Code: ' + startCode)
          return
        }

        viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MULTIPLE_SELECTION)

        const documentId = `urn:${urn}`

        Autodesk.Viewing.Document.load(documentId, async (viewerDocument) => {
            let defaultModel = viewerDocument.getRoot().getDefaultGeometry()
            viewer.loadDocumentNode(viewerDocument, defaultModel);

            await viewer.loadExtension('DataDeviceSensors', extensionOptions, projectId);
            await viewer.loadExtension('DataRoomSensors', extensionOptions);
            

            viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,async (e) => {
      
              const instanceTree = e.model.getData().instanceTree;
                const rootNodeId = instanceTree.getRootId();
                const categoryCount = {};

                // Función recursiva para contar `dbId` en un nodo específico
                function countDbIdsInNode(nodeId) {
                    let count = 0;

                    // Contar los `dbId` de los hijos de este nodo
                    instanceTree.enumNodeChildren(nodeId, (childNodeId) => {
                        count += countDbIdsInNode(childNodeId); // Contar recursivamente
                    });

                    // Si el nodo actual no tiene hijos, contarlo como un `dbId`
                    const isLeafNode = instanceTree.getChildCount ? 
                                        instanceTree.getChildCount(nodeId) === 0 : 
                                        true; // Asume que es hoja si no hay función para contar hijos

                    if (isLeafNode) {
                        count += 1; // Ajusta según la necesidad; suma 1 si es un nodo hoja
                    }

                    return count;
                }

                // Obtener todos los nodos hijos del nodo raíz
                instanceTree.enumNodeChildren(rootNodeId, (nodeId) => {
                    const nodeName = instanceTree.getNodeName(nodeId);
                    const categoryName = nodeName.replace(/\s*\[.*?\]\s*/g, ''); // Limpiar el nombre de la categoría

                    // Asegúrate de que la categoría exista en el objeto `categoryCount`
                    if (!categoryCount[categoryName]) {
                        categoryCount[categoryName] = 0;
                    }

                    // Contar los elementos dentro de este nodo
                    const count = countDbIdsInNode(nodeId);
                    categoryCount[categoryName] += count;
                });

      
              setCategoryData(categoryCount)
              setIsLoadingTree(false)
      
      
            })
              
            })

            viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,(e) => {

              setSelectionCount(e.dbIdArray.length)
              setSelection(e.dbIdArray)
            })


            
        }, () =>{
          console.error('Fail' )
        })
      
      
    }