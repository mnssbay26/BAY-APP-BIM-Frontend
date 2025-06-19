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
