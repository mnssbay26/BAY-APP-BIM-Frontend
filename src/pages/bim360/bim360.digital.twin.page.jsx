import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from "react";

import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import { digitalTwinViewer } from "../../../utils/viewers/digital.twin.viewer";

import {
    fetchBim360ProjectData,
    fetchBim360FederatedModel,
} from "../services/bim360.services.js";

import RealTimeChart from "../../components/digital_twin_components/temperature.device.chart";
import DevicePowerChart from "../../components/digital_twin_components/electrical.device.chart";
import DeviceWaterChart from "../../components/digital_twin_components/water.device.chart";
import DevicePopover from "../../components/digital_twin_components/power.device.chart";

const Bim360DigitalTwin = () => {
    //General
    const { projectId, accountId } = useParams();
    const [cookies] = useCookies(["access_token"]);

    const [federatedModel, setFederatedModel] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    //Table and Viewer
    const [showViewer, setShowViewer] = useState(true);
    const [isPullMenuOpen, setIsPullMenuOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            fetchBim360FederatedModel(projectId, accountId),
            fetchBim360ProjectData(projectId, accountId),
        ])
            .then(([federatedModelResp, projectDataResp]) => {
                if (projectDataResp) {
                    setProjectData(projectDataResp);
                }

                if (federatedModelResp) {
                    setFederatedModel(federatedModelResp);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching federated model:", error);
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [projectId, accountId]);

    const handleSpriteClick = (device) => {
        setSelectedDevice(device);
    };

    useEffect(() => {
        if (!federatedModel || window.viewerInitialized) return;

        digitalTwinViewer({
            federatedModel,

            projectId: projectId,
            extensionOptions: {
                onSpriteClick: handleSpriteClick,
                projectId: projectId,
            },
        });

        window.viewerInitialized = true;
    }, [federatedModel, projectId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".relative")) {
                setIsPullMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    if (loading) {
        return <BayerLoadingOverlay message="Loading project details..." />;
    }

    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    return (
        <BayerBim360MainLayout accountId={accountId} projectId={projectId}>
            {error && (
                <div
                    className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
                    role="alert"
                >
                    <span className="font-medium">Error!</span> {error}
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
                        {projectData.name}
                    </h2>

                    <hr className="my-4 border-t border-gray-300" />

                    {/* Viewer + Charts container */}
                    <div className="flex" style={{ height: "650px" }}>
                        {/* Viewer column */}
                        <div
                            className={`
                  transition-all duration-300 overflow-hidden bg-white 
                  shadow-lg rounded-lg p-4 mr-2
                  ${showViewer ? "w-3/6" : "w-0"}
                `}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2
                                    className={`text-xl font-bold transition-opacity duration-300 ${
                                        showViewer ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    Model Viewer
                                </h2>
                            </div>
                            <hr className="my-4 border-t border-gray-300" />
                            <div
                                className={`relative ${
                                    showViewer ? "block" : "hidden"
                                }`}
                                style={{ height: "550px" }}
                            >
                                <div
                                    className="absolute top-0 left-0 right-0 bottom-0"
                                    id="BAYDigitalTwinViewer"
                                />
                            </div>
                        </div>

                        {/* Charts container */}
                        <div className="w-3/6 border-l border-gray-300 p-1">
                            <div
                                className="flex flex-col w-full"
                                style={{ height: "700px" }}
                            >
                                {/* 1/3 - Temperature */}
                                <div className="flex-1 mb-1">
                                    <h2 className="font-bold text-sm">
                                        Real-Time Temperature
                                    </h2>
                                    <RealTimeChart
                                        selectedDevice={selectedDevice}
                                    />
                                </div>
                                {/* 2/3 - Energy */}
                                <div className="flex-1 mb-1">
                                    <h2 className="font-bold text-sm">
                                        Real-Time Energy Consumption
                                    </h2>
                                    <DevicePowerChart
                                        selectedDevice={selectedDevice}
                                    />
                                </div>
                                {/* 3/3 - Water */}
                                <div className="flex-1 mb-1">
                                    <h2 className="font-bold text-sm">
                                        Real-Time Humidity
                                    </h2>
                                    <DeviceWaterChart
                                        selectedDevice={selectedDevice}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </BayerBim360MainLayout>
    );
};

export default React.memo(Bim360DigitalTwin);
