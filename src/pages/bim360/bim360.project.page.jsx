import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generalViewer } from "../../../utils/viewers/general.viewer.js";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import { projectSliderSettings } from "../../pages/utils/project.slider.settings.utils.js";
import { TotalsCard } from "@/components/general/general.totals.card.jsx";

import {
    fetchBim360ProjectData,
    fetchBim360ProjectUsers,
    fetchBim360ProjectIssues,
    fetchBim360ProjectRfis,
    fetchBim360FederatedModel,
} from "../../pages/services/bim360.services.js";

const Bim360ProjectPage = () => {
    const { projectId, accountId } = useParams();
    const [projectData, setProjectData] = useState(null);

    const [issuesTotals, setIssuesTotals] = useState({
        total: 0,
        open: 0,
        closed: 0,
        answered: 0,
        completed: 0,
    });

    const [usersTotals, setUsersTotals] = useState({
        total: 0,
    });

    const [rfisTotals, setRfisTotals] = useState({
        total: 0,
        open: 0,
        answered: 0,
        closed: 0,
    });

    const [federatedModel, setFederatedModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.allSettled([
            fetchBim360ProjectData(projectId, accountId),
            fetchBim360ProjectIssues(projectId, accountId),
            fetchBim360ProjectUsers(projectId, accountId),
            fetchBim360ProjectRfis(projectId, accountId),

            fetchBim360FederatedModel(projectId, accountId),
        ])
            .then((results) => {
                if (results[0].status === "fulfilled" && results[0].value) {
                    setProjectData(results[0].value);
                }

                if (
                    results[1].status === "fulfilled" &&
                    results[1].value &&
                    results[1].value.issues
                ) {
                    const issuesData = results[1].value;
                    setIssuesTotals({
                        total: issuesData.issues.length,
                        open: issuesData.issues.filter(
                            (issue) => issue.status === "open"
                        ).length,
                        answered: issuesData.issues.filter(
                            (issue) => issue.status === "answered"
                        ).length,
                        closed: issuesData.issues.filter(
                            (issue) => issue.status === "closed"
                        ).length,
                        completed: issuesData.issues.filter(
                            (issue) => issue.status === "completed"
                        ).length,
                    });
                }

                if (
                    results[2].status === "fulfilled" &&
                    results[2].value &&
                    results[2].value.users
                ) {
                    setUsersTotals({ total: results[2].value.users.length });
                }

                if (
                    results[3].status === "fulfilled" &&
                    results[3].value &&
                    results[3].value.rfis
                ) {
                    const rfisData = results[3].value;
                    setRfisTotals({
                        total: rfisData.rfis.length,
                        open: rfisData.rfis.filter(
                            (rfi) => rfi.status === "open"
                        ).length,
                        answered: rfisData.rfis.filter(
                            (rfi) => rfi.status === "answered"
                        ).length,
                        closed: rfisData.rfis.filter(
                            (rfi) => rfi.status === "closed"
                        ).length,
                    });
                }

                if (results[4].status === "fulfilled" && results[4].value) {
                    setFederatedModel(results[4].value);
                }
            })
            .catch((err) => {
                console.error("Critical error in project data flow:", err);
                setError(
                    err.message ||
                        "Unexpected critical error loading project data"
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, [projectId, accountId]);

    console.debug("FederatedModel:", federatedModel);

    useEffect(() => {
        if (federatedModel && federatedModel.length > 0) {
            generalViewer(federatedModel);
        }
    }, [federatedModel]);

    if (loading) {
        return <BayerLoadingOverlay message="Loading project details..." />;
    }

    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    const totalsSliderItems = [
        {
            label: "Total Users",
            value: usersTotals.total,
            type: "total_users",
            description: undefined,
        },
        {
            label: "Total Issues",
            value: issuesTotals.total,
            type: "total_issues",
            description: `${issuesTotals.open} open, ${issuesTotals.closed} closed`,
        },
        {
            label: "Open Issues",
            value: issuesTotals.open,
            type: "open_issues",
            description: `${issuesTotals.open} actual`,
        },
        {
            label: "Answered Issues",
            value: issuesTotals.answered,
            type: "answered_issues",
            description: `Last 30d`,
        },
        {
            label: "Closed Issues",
            value: issuesTotals.closed,
            type: "closed_issues",
            description: `Completed: ${issuesTotals.completed}`,
        },
        {
            label: "Completed Issues",
            value: issuesTotals.completed,
            type: "completed_issues",
        },
        {
            label: "Total RFIs",
            value: rfisTotals.total,
            type: "total_rfis",
            description: `${rfisTotals.open} open, ${rfisTotals.closed} closed`,
        },
        {
            label: "Open RFIs",
            value: rfisTotals.open,
            type: "open_rfis",
        },
        {
            label: "Answered RFIs",
            value: rfisTotals.answered,
            type: "answered_rfis",
        },
        {
            label: "Closed RFIs",
            value: rfisTotals.closed,
            type: "closed_rfis",
        },
    ].filter((item) => typeof item.value === "number");

    return (
        <BayerBim360MainLayout projectId={projectId} accountId={accountId}>
            {error && (
                <div
                    className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
                    role="alert"
                >
                    <span className="font-medium">Error!</span> {error}
                </div>
            )}

            {!projectData && !error && (
                <div
                    className="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg"
                    role="alert"
                >
                    Project data could not be loaded.
                </div>
            )}

            {projectData && (
                <>
                    <h1 className="text-2xl text-right font-bold mb-1 text-gray-800">
                        Project Home Page
                    </h1>
                    <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
                        {projectData.name}
                    </h2>

                    <hr className="my-4 border-t border-gray-300" />

                    <div className="flex flex-col lg:flex-row h-auto lg:h-[650px] w-full gap-4">
                        {/* Contenedor del Visor */}
                        <div className="flex space-x-2 mt-4 w-full lg:w-4/5 min-w-0">
                            <div className="w-full h-[650px] bg-white rounded shadow p-4 flex flex-col">
                                <h1 className="text-lg mb-1 font-semibold">
                                    Project Model Viewer
                                </h1>
                                <hr className="my-4 border-t border-gray-300" />
                                <div
                                    className="flex-1 w-full h-[550px] relative"
                                    id="generalViewerContainer"
                                ></div>
                            </div>
                        </div>

                        {/* Contenedor del Slider de Totales */}
                        <div className="flex space-x-4 mt-4 w-full lg:w-1/5 min-w-0">
                            <div className="w-full h-[650px] bg-white rounded shadow p-4 flex flex-col">
                                <h2 className="text-lg mb-1 font-semibold">
                                    Project Stats
                                </h2>
                                <hr className="my-4 border-t border-gray-300" />
                                <div className="bg-white overflow-hidden h-[620px] lg:min-h-50">
                                    {totalsSliderItems.length > 0 ? (
                                        <Slider
                                            {...projectSliderSettings(
                                                totalsSliderItems
                                            )}
                                        >
                                            {totalsSliderItems.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-1 h-[125px]"
                                                    >
                                                        <TotalsCard
                                                            title={item.label}
                                                            value={item.value}
                                                            description={
                                                                item.description
                                                            }
                                                            type={item.type}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </Slider>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            No stats available.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </BayerBim360MainLayout>
    );
};

export default Bim360ProjectPage;
