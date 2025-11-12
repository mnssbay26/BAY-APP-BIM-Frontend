import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import BayerAccMainLayout from "@/components/platform_general_components/acc_components/acc.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import { dataModel } from "../../../utils/viewers/database.viewer";

import {
  elementtype,
  propertyMappings,
  numericFields,
  disciplineOptions,
} from "../../lib/database.constants";

import { defaultRowData as defaultRow } from "../../lib/default.row";

import {
  isolateObjectsInViewer,
  showAllObjects,
  hideObjectsInViewer,
  highlightObjectsInViewer,
  resetViewerView,
} from "../../lib/viewer.actions";

import {
  fetchAccFederatedModel,
  fetchAccProjectData,
} from "../services/acc.services.js";

import {
  mapCategoryToElementType,
  reorderRowsByDiscipline,
} from "../../lib/general.functions";

import { useTableControls } from "../services/database.table";
import DatabaseTable from "../../components/model_database_components/database.table";
import ControlPanel from "../../components/model_database_components/control.panel";

const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

const sampleQuestions = [
  "Tell me the total volume of structural foundations discipline",
  "Tell me the total volume of concrete structure discipline walls elements",
  "Isolate concrete structure",
  "Hide aluminium works",
  "dbId 31796 the planed start construction date",
  "Change dbId 31796 planned start construction date to 03/10/2025",
  "Tell me the construction start and finish dates of elements in the discipline concrete structure",
];

const AccModelDatabasePage = () => {
  // General
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);
  const [federatedModel, setFederatedModel] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Table & Viewer
  const defaultRowData = useMemo(() => defaultRow, []);
  const propertyMapping = useMemo(() => propertyMappings["General"], []);
  const [data, setData] = useState([defaultRow]);
  const [collapsedDisciplines, setCollapsedDisciplines] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [lastClickedRowNumber, setLastClickedRowNumber] = useState(null);
  const [showViewer, setShowViewer] = useState(true);
  const [showAIpanel, setAIpanel] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncViewerSelection, setSyncViewerSelection] = useState(false);
  const syncViewerSelectionRef = useRef(false);
  const [selectedDisciplineForColor, setSelectedDisciplineForColor] =
    useState("");
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [isPullMenuOpen, setIsPullMenuOpen] = useState(false);

  // AI Panel
  const [userMessage, setUserMessage] = useState("");
  const [chatbotResponse, setChatbotResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState(
    JSON.parse(localStorage.getItem("conversationHistory")) || []
  );

  const viewerWidthClass = useMemo(() => {
    if (!showViewer) return "w-0";
    return "w-2/5";
  }, [showViewer]);

  const tableWidthClass = useMemo(() => {
    if (!showViewer && !showAIpanel) return "w-full";
    if (showViewer && !showAIpanel) return "w-3/5";
    if (showViewer && showAIpanel) return "w-2/5";
    if (!showViewer && showAIpanel) return "w-4/5";
    return "w-full";
  }, [showViewer, showAIpanel]);

  const aiWidthClass = useMemo(() => (showAIpanel ? "w-1/5" : "w-0"), [showAIpanel]);

  useEffect(() => {
    localStorage.setItem(
      "conversationHistory",
      JSON.stringify(conversationHistory)
    );
  }, [conversationHistory]);

  const { handleAddRow, handleRemoveRow } = useTableControls(
    setData,
    defaultRow,
    reorderRowsByDiscipline
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAccFederatedModel(projectId, accountId),
      fetchAccProjectData(projectId, accountId),
    ])
      .then(([federatedModelResp, projectDataResp]) => {
        if (projectDataResp) setProjectData(projectDataResp);
        if (federatedModelResp) setFederatedModel(federatedModelResp);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error fetching federated model:", e);
        setError(e);
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  const fieldsToCheck = useMemo(
    () => [
      "Description",
      "Length",
      "Width",
      "Height",
      "Perimeter",
      "Area",
      "Thickness",
      "Volume",
      "Level",
      "Material",
    ],
    []
  );

  const updateRowNumbers = (rows) =>
    rows.map((row, idx) => ({ ...row, rowNumber: idx + 1 }));

  // Robust extraction for ACC
  useEffect(() => {
    const getFirst = (obj, ...keys) => {
      for (const k of keys) {
        const v = obj?.[k];
        if (v != null) {
          const s = String(v).trim();
          if (s && s.toLowerCase() !== "no especificado") return s;
        }
      }
      return "";
    };

    const guessElementType = (s) => {
      if (!s) return null;
      const t = s.toLowerCase();
      if (t.includes("roof")) return "Roofs";
      if (t.includes("railing")) return "Railings";
      if (t.includes("stair")) return "Stairs";
      if (t.includes("curtain")) return "Curtain Walls";
      if (t.includes("window")) return "Windows";
      if (t.includes("door")) return "Doors";
      if (t.includes("wall")) return "Walls";
      if (t.includes("floor") || t.includes("slab")) return "Floors";
      if (t.includes("pipe")) return "Pipes";
      if (t.includes("duct")) return "Ducts";
      if (t.includes("generic")) return "Generic Models";
      if (t.includes("column")) return "Structural Columns";
      if (t.includes("foundation")) return "Structural Foundations";
      return null;
    };

    const normalizeDate = (value) => {
      const raw = String(value || "").trim();
      if (!raw || raw.toLowerCase() === "no especificado") return "";
      const parts = raw.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `20${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
      return raw;
    };

    const lowerMapping = new Map(
      Object.entries(propertyMapping).map(([k, v]) => [k.toLowerCase(), v])
    );

    const handleDataExtracted = (event) => {
      const { dbId, properties } = event.detail;
      if (!properties || typeof properties !== "object") {
        console.error("Invalid properties data:", properties);
        return;
      }

      // 1) Base mapping (case-insensitive) + date normalization
      const mappedProperties = Object.entries(properties).reduce(
        (acc, [k, v]) => {
          const keyLower = k.toLowerCase();
          const mappedKey = lowerMapping.get(keyLower);
          let value = v ?? "";

          if (mappedKey && mappedKey.toLowerCase().includes("date")) {
            value = normalizeDate(value);
          }

          if (mappedKey) acc[mappedKey] = String(value);
          return acc;
        },
        {}
      );

      // 2) Fallbacks
      if (!mappedProperties.TypeName) {
        mappedProperties.TypeName = getFirst(
          properties,
          "TypeName",
          "Type Name",
          "Name",
          "Element Name",
          "Item Name"
        );
      }
      if (!mappedProperties.Description) {
        mappedProperties.Description = getFirst(
          properties,
          "Description",
          "Long Description",
          "Comments",
          "Comment",
          "Type Mark",
          "Mark"
        );
      }

      // 3) Ensure required fields exist
      fieldsToCheck.forEach((field) => {
        if (!Object.prototype.hasOwnProperty.call(mappedProperties, field)) {
          mappedProperties[field] = "";
        }
      });

      // 4) Robust ElementType (Category map -> heuristic)
      const categoryHint = getFirst(
        properties,
        "Category",
        "Family",
        "Type",
        "Category Name"
      );
      const elementType =
        mapCategoryToElementType(categoryHint) ||
        guessElementType(categoryHint) ||
        guessElementType(
          getFirst(properties, "Name", "Type Name", "TypeName", "Element Name")
        ) ||
        "";

      const newRow = {
        ...defaultRow,
        dbId,
        ElementType: elementType,
        ...mappedProperties,
      };

      setData((prevData) => {
        const existsDbId = prevData.some(
          (r) => String(r.dbId) === String(dbId)
        );
        if (existsDbId) {
          alert("This element is already in the table");
          return prevData;
        }
        const updatedData = [...prevData, newRow];
        return updateRowNumbers(updatedData);
      });
    };

    window.addEventListener("dbIdDataExtracted", handleDataExtracted);
    return () => {
      window.removeEventListener("dbIdDataExtracted", handleDataExtracted);
    };
  }, [propertyMapping, fieldsToCheck]);

  const groupedData = useMemo(() => {
    return data.reduce((acc, row) => {
      const discipline = row.Discipline || "No Discipline";
      if (!acc[discipline]) acc[discipline] = [];
      acc[discipline].push(row);
      return acc;
    }, {});
  }, [data]);

  const calculateTotals = (rows) => {
    const totals = {
      Length: 0,
      Width: 0,
      Height: 0,
      Perimeter: 0,
      Area: 0,
      Volume: 0,
    };
    rows.forEach((row) => {
      Object.keys(totals).forEach((key) => {
        totals[key] += parseFloat(row[key]) || 0;
      });
    });
    return totals;
  };

  const totalsByDiscipline = useMemo(() => {
    return Object.keys(groupedData).reduce((acc, disc) => {
      acc[disc] = calculateTotals(groupedData[disc]);
      return acc;
    }, {});
  }, [groupedData]);

  const grandTotals = useMemo(() => calculateTotals(data), [data]);

  const handleDisciplineChange = (row, newValue) => {
    const index = data.findIndex((r) => r === row);
    if (index === -1) return;

    if (selectedRows.includes(row.dbId)) {
      setData((prev) =>
        prev.map((item) =>
          selectedRows.includes(item.dbId)
            ? { ...item, Discipline: newValue }
            : item
        )
      );
    } else {
      const clone = [...data];
      clone[index] = { ...clone[index], Discipline: newValue };
      setData(clone);
    }
  };

  const handleElementTypeChange = (row, newValue) => {
    const index = data.findIndex((r) => r === row);
    if (index === -1) return;

    if (selectedRows.includes(row.dbId)) {
      setData((prev) =>
        prev.map((item) =>
          selectedRows.includes(item.dbId)
            ? { ...item, ElementType: newValue }
            : item
        )
      );
    } else {
      const clone = [...data];
      clone[index] = { ...clone[index], ElementType: newValue };
      setData(clone);
    }
  };

  const handleInputChange = (row, event) => {
    const { name, value } = event.target;
    const index = data.findIndex((r) => r === row);
    if (index === -1) return;

    const currentRow = data[index];
    if (selectedRows.includes(currentRow.dbId)) {
      setData((prev) =>
        prev.map((item) =>
          selectedRows.includes(item.dbId) ? { ...item, [name]: value } : item
        )
      );
    } else {
      const newArr = [...data];
      newArr[index] = { ...currentRow, [name]: value };
      setData(newArr);
    }
  };

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const handleViewerSelectionChanged = useCallback((dbIdArray) => {
    const foundDbIds = dataRef.current
      .filter((row) => dbIdArray.includes(Number(row.dbId)))
      .map((row) => row.dbId);

    setSelectedRows(foundDbIds.length ? foundDbIds : []);
    setSelectionCount(dbIdArray.length);
  }, []);

  // Init viewer (use a page-specific guard to avoid cross-page interference)
  useEffect(() => {
    if (!federatedModel || window.accViewerInitialized) return;

    const conditionalSelectionHandler = (dbIdArray) => {
      if (!syncViewerSelectionRef.current) return;
      handleViewerSelectionChanged(dbIdArray);
    };

    dataModel({
      federatedModel,
      setSelectionCount,
      setSelection: conditionalSelectionHandler,
      setIsLoadingTree,
      setCategoryData,
    });

    window.accViewerInitialized = true;
  }, [federatedModel, handleViewerSelectionChanged]);

  useEffect(() => {
    syncViewerSelectionRef.current = syncViewerSelection;
    if (syncViewerSelection && window.databaseviewer) {
      const currentDbIds = window.databaseviewer.getSelection() || [];
      handleViewerSelectionChanged(currentDbIds);
    }
  }, [syncViewerSelection, handleViewerSelectionChanged]);

  const getCsrfToken = async () => {
    const resp = await fetch(`${backendUrl}/csrf-token`, {
      credentials: "include",
    });
    const data = await resp.json();
    return data.csrfToken;
  };

  const handleSubmit = async () => {
    try {
      const csrfToken = await getCsrfToken();

      // Clean numeric fields
      const cleanedData = data.map((row) => {
        const cleanedRow = { ...row };
        numericFields.forEach((field) => {
          const v = cleanedRow[field];
          if (typeof v === "string" && !v.trim()) cleanedRow[field] = null;
          else if (typeof v === "string") {
            const n = parseFloat(v);
            cleanedRow[field] = isNaN(n) ? null : n;
          }
        });
        return cleanedRow;
      });

      const url = `${backendUrl}/modeldata/${accountId}/${projectId}/data`;
      const resp = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-xsrf-token": csrfToken,
        },
        body: JSON.stringify({
          accountId,
          projectId,
          service: "model-data",
          modelUrn: `${federatedModel}`,
          items: cleanedData,
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Error ${resp.status}: ${errorText}`);
      }

      const ct = resp.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await resp.text();
        throw new Error(
          `Unexpected response (${ct}). Snippet: ${txt.slice(0, 120)}`
        );
      }

      const result = await resp.json();
      console.debug("Save result:", result);
      alert("¡Datos enviados correctamente!");
      await handlePullData();
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      alert(`Error al enviar datos: ${error.message}`);
    }
  };

  const disciplineNameFix = (name) =>
    !name ? "" : name.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  const handlePullData = async (discipline = null) => {
    try {
      let url = `${backendUrl}/modeldata/${accountId}/${projectId}/data?modelUrn=${encodeURIComponent(
        federatedModel
      )}`;
      if (discipline) url += `&discipline=${encodeURIComponent(discipline)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.debug("Response:", response);

      if (response.ok) {
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          let tempRows = result.data.map((item) => {
            const value = item || {};
            return {
              dbId: value.dbId || "",
              Discipline: disciplineNameFix(value.Discipline) || "",
              ElementType: disciplineNameFix(value.ElementType || ""),
              TypeName: disciplineNameFix(value.TypeName || ""),
              Description: disciplineNameFix(value.Description || ""),
              TypeMark: disciplineNameFix(value.TypeMark || ""),
              Length: value.Length ?? "",
              Width: value.Width ?? "",
              Height: value.Height ?? "",
              Perimeter: value.Perimeter ?? "",
              Area: value.Area ?? "",
              Thickness: value.Thickness ?? "",
              Volume: value.Volume ?? "",
              Level: disciplineNameFix(value.Level || ""),
              Material: disciplineNameFix(value.Material || ""),
              Model: disciplineNameFix(value.Model || ""),
              Manufacturer: disciplineNameFix(value.Manufacturer || ""),
              EnergyConsumption: value.EnergyConsumption ?? "",
              CarbonFootprint: value.CarbonFootprint ?? "",
              WaterConsumption: value.WaterConsumption ?? "",
              LifeCycleStage: value.LifeCycleStage || "",
            };
          });

          tempRows = reorderRowsByDiscipline(tempRows);
          setData(tempRows);
          alert("Data successfully loaded");
        } else {
          alert("No data was found for this project.");
        }
      } else {
        const errorData = await response.json();
        console.error("Error fetching data:", errorData.message);
        alert(`Error fetching data: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Request error:", error);
      alert(`Request error: ${error.message}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) setIsPullMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleApplyColorToDiscipline = async () => {
    if (!selectedDisciplineForColor || !selectedColor) return;

    try {
      const url = `${backendUrl}/modeldata/${accountId}/${projectId}/data?modelUrn=${encodeURIComponent(
        federatedModel
      )}&discipline=${encodeURIComponent(selectedDisciplineForColor)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error fetching discipline data.");

      const result = await response.json();
      if (!result.data) return;
      const dbIds = result.data.map((item) => parseInt(item.dbId, 10));

      if (
        window.databaseviewer &&
        typeof window.databaseviewer.applyColorByDiscipline === "function"
      ) {
        window.databaseviewer.applyColorByDiscipline(dbIds, selectedColor);
      } else {
        console.warn("applyColorByDiscipline not available in the viewer.");
      }
    } catch (error) {
      console.error("Error applying color:", error);
    }
  };

  const cleanprojectId = projectId.substring(2);

  const fetchAllData = async (projectId) => {
  let allData = [];
  let page = 1;
  const limit = 250;
  let hasMoreData = true;

  const base = `${backendUrl}/modeldata/${accountId}/${projectId}/data?modelUrn=${encodeURIComponent(federatedModel)}`;

  try {
    while (hasMoreData) {
      const response = await fetch(`${base}&page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include", // <-- necesario si autenticas con cookie
      });

      if (!response.ok) throw new Error(`GET ${response.status} ${response.statusText}`);

      const result = await response.json();
      const { data } = result;
      if (!Array.isArray(data)) throw new Error("Wrong data format");

      allData = allData.concat(data);
      hasMoreData = data.length === limit;
      page++;
    }
    return allData;
  } catch (err) {
    console.error("Error fetching all data:", err);
    return [];
  }
};
  const handleSendMessage = async () => {
    setIsLoading(true);
    try {
      const lowerMsg = userMessage.toLowerCase();
      let endpoint = `${backendUrl}/ai-modeldata`;
      let isViewerCommand = false;
      let isDBIDCommand = false;
      let isUpdateCommand = false;
      let isDateRangeCommand = false;

      const updateKeywords = [
        "change",
        "update",
        "modify",
        "transform",
        "upgrade",
        "adjust",
        "cambia",
        "modifica",
        "modificar",
        "sustituye",
        "sustituir",
        "adapta",
        "adaptar",
      ];
      const containsDBID = lowerMsg.includes("dbid");
      const containsUpdateKeyword = updateKeywords.some((k) =>
        lowerMsg.includes(k)
      );

      if (containsDBID && !containsUpdateKeyword) {
        endpoint = `${backendUrl}/ai-modeldata/dbid-question`;
        isDBIDCommand = true;
      } else if (containsDBID && containsUpdateKeyword) {
        endpoint = `${backendUrl}/ai-modeldata/update-field`;
        isUpdateCommand = true;
      } else if (
        lowerMsg.startsWith("aisla") ||
        lowerMsg.startsWith("oculta") ||
        lowerMsg.startsWith("resalta") ||
        lowerMsg.startsWith("isolate") ||
        lowerMsg.startsWith("hide") ||
        lowerMsg.startsWith("highlight")
      ) {
        endpoint = `${backendUrl}/ai-modeldata/autodesk-command`;
        isViewerCommand = true;
      } else if (
        lowerMsg.startsWith("date range:") ||
        (lowerMsg.includes("construction") && lowerMsg.includes("dates"))
      ) {
        endpoint = `${backendUrl}/ai-modeldata/date-range`;
        isDateRangeCommand = true;
      }

      let response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          projectId: cleanprojectId,
          contextData: null,
        }),
      });

      let respData = await response.json();

      if (isDBIDCommand) {
        setChatbotResponse(`${respData.reply}\nData: ${JSON.stringify(respData.data)}`);
      } else if (isUpdateCommand) {
        setChatbotResponse(respData.reply);
        const affectedDiscipline = respData.discipline;
        if (affectedDiscipline) {
          await handlePullData(affectedDiscipline);
        } else {
          await handlePullData();
        }
      } else if (isDateRangeCommand) {
        setChatbotResponse(respData.reply);
      } else if (!isViewerCommand) {
        if (respData.reply.includes("ha sido actualizado")) {
          setChatbotResponse(respData.reply);
          setIsLoading(false);
          const affectedDiscipline = respData.discipline;
          if (affectedDiscipline) await handlePullData(affectedDiscipline);
          else await handlePullData();
          return;
        }
        if (!respData.reply.includes("No encontré elementos")) {
          setChatbotResponse(respData.reply);
          setIsLoading(false);
          return;
        }
        // Retry with full context
        const allData = await fetchAllData(cleanprojectId);
        response = await fetch(`${backendUrl}/ai-modeldata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            projectId: cleanprojectId,
            contextData: allData,
          }),
        });

        respData = await response.json();
        setChatbotResponse(respData.reply);
      } else {
        // Viewer command
        setChatbotResponse(respData.reply);
        if (respData.dbIds && respData.action) {
          switch (respData.action) {
            case "isolate":
              isolateObjectsInViewer(window.data4Dviewer, respData.dbIds);
              break;
            case "hide":
              hideObjectsInViewer(window.data4Dviewer, respData.dbIds);
              break;
            case "highlight":
              highlightObjectsInViewer(window.data4Dviewer, respData.dbIds);
              break;
            default:
              break;
          }
        }
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatbotResponse("There was an error processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <BayerLoadingOverlay message="Loading project details..." />;
  }

  if (error) {
    return <div className="text-red-600">{String(error)}</div>;
  }

  return (
    <BayerAccMainLayout accountId={accountId} projectId={projectId}>
      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          <span className="font-medium">Error!</span> {String(error)}
        </div>
      )}

      {!federatedModel && !error && (
        <div
          className="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg"
          role="alert"
        >
          Model data could not be loaded.
        </div>
      )}

      {federatedModel && (
        <>
          <h1 className="text-2xl text-right font-bold mb-1 text-gray-800">
            Project Home Page
          </h1>
          <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
            {projectData?.name}
          </h2>

          <hr className="my-4 border-t border-gray-300" />
          {/* Control Panel */}
          <ControlPanel
            viewer={window.databaseviewer}
            showViewer={showViewer}
            setShowViewer={setShowViewer}
            showAIpanel={showAIpanel}
            setAIpanel={setAIpanel}
            syncViewerSelection={syncViewerSelection}
            setSyncViewerSelection={setSyncViewerSelection}
            handleAddRow={handleAddRow}
            handleRemoveRow={handleRemoveRow}
            handleSubmit={handleSubmit}
            handlePullData={handlePullData}
            resetViewerView={resetViewerView}
            showAllObjects={showAllObjects}
            disciplineOptions={disciplineOptions}
            selectedDisciplineForColor={selectedDisciplineForColor}
            setSelectedDisciplineForColor={setSelectedDisciplineForColor}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            handleApplyColorToDiscipline={handleApplyColorToDiscipline}
            handleAddCustomRow={() => {}}
            handleRemoveCustomRow={() => {}}
            handleSubmitCustomTable={() => {}}
            handlePullCustomTableData={() => {}}
          />

          <div className="h-12"></div>

          {/* Viewer + Table + AI Panel */}
          <div className="flex" style={{ height: "650px" }}>
            {/* Viewer */}
            <div
              className={`
                transition-all duration-300 overflow-hidden bg-white shadow-lg rounded-lg p-4 mr-2
                ${viewerWidthClass}
              `}
            >
              {showViewer && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">Model Viewer</h2>
                  </div>
                  <hr className="my-4 border-t border-gray-300" />
                  <div className="relative" style={{ height: "550px" }}>
                    <div
                      className="absolute top-0 left-0 right-0 bottom-0"
                      id="ModelDatabaseViewer"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Table */}
            <div
              className={`
                transition-all duration-300 bg-white shadow-lg rounded-lg p-4 mr-2
                flex flex-col
                ${tableWidthClass}
              `}
            >
              <DatabaseTable
                viewer={window.databaseviewer}
                data={data}
                groupedData={groupedData}
                totalsByDiscipline={totalsByDiscipline}
                grandTotals={grandTotals}
                handleInputChange={handleInputChange}
                handleDisciplineChange={handleDisciplineChange}
                handleElementTypeChange={handleElementTypeChange}
                disciplineOptions={disciplineOptions}
                elementtype={elementtype}
                isolateObjectsInViewer={isolateObjectsInViewer}
                hideObjectsInViewer={hideObjectsInViewer}
                collapsedDisciplines={collapsedDisciplines}
                setCollapsedDisciplines={setCollapsedDisciplines}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                lastClickedRowNumber={lastClickedRowNumber}
                setLastClickedRowNumber={setLastClickedRowNumber}
              />
            </div>

            {/* AI Panel */}
            <div
              className={`
                transition-all duration-300 overflow-hidden bg-white shadow-lg rounded-lg p-4 mr-2
                ${aiWidthClass}
              `}
            >
              {showAIpanel && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-right w-full">
                      AI Panel
                    </h2>
                  </div>
                  <hr className="my-4 border-t border-gray-300" />
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <textarea
                      className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                      rows="3"
                      placeholder="Write your question..."
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={userMessage.trim() === ""}
                      className={`w-full py-2 px-4 rounded text-xs ${
                        userMessage.trim() === ""
                          ? "bg-[#2ea3e3] text-white cursor-not-allowed"
                          : "bg-[#F19A3E] text-white hover:bg-[#FE7F2D]"
                      }`}
                    >
                      Send
                    </button>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-xs">
                    <p className="text-gray-700 font-medium text-xs">Answer:</p>
                    <p className="mt-2 text-gray-800 text-xs">
                      {chatbotResponse}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700 font-medium text-[0.7rem]">
                      Sample Questions:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {sampleQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => setUserMessage(q)}
                          className="bg-gray-200 hover:bg-gray-300 text-[0.7rem] py-1 px-2 rounded"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </BayerAccMainLayout>
  );
};

export default AccModelDatabasePage;
