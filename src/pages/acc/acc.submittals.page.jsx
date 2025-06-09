import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BayerAccMainLayout from "@/components/platform_general_components/acc_components/acc.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchAccProjectData,
  fetchAccProjectSubmittals,
} from "../../pages/services/acc.services.js";

import SubmittalsTable from "../../components/submittals_components/acc.submittals.table.jsx";
import SubmittalsStatusChart from "../../components/submittals_components/acc.submittals.status.chart.jsx";
import SubmittalsSpecChart from "../../components/submittals_components/acc.submittals.spec.chart.jsx";

import { reportsSliderSettings } from "../utils/project.slider.settings.utils.js";

const AccProjectSubmittalsPage = () => {
  const [projectsData, setProjectsData] = useState(null);
  const [projectData, setProject] = useState({});
  const { projectId, accountId } = useParams();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [submittals, setSubmittals] = useState([]);
  const [submittalsTotals, setSubmittalsTotals] = useState({
    total: 0,
    waitingforsubmission: 0,
    inreview: 0,
    reviewed: 0,
    submitted: 0,
    closed: 0,
  });
  const [filteredSubmittals, setFilteredSubmittals] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [specCounts, setSpecCounts] = useState({});

  const [activeFilters, setActiveFilters] = useState({
    status: null,
    spec: null,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAccProjectData(projectId, accountId),
      fetchAccProjectSubmittals(projectId, accountId),
    ])
      .then(([projectData, submittalsData]) => {
        if (projectData) {
          setProject(projectData);
        }

        if (submittalsData) {
          setSubmittals(submittalsData.submittals);
        }

        if (submittalsData && submittalsData.submittals) {
          setFilteredSubmittals(submittalsData.submittals);
          setSubmittalsTotals({
            total: submittalsData.submittals.length,
            waitingforsubmission: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Waiting for submission"
            ).length,
            inreview: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "In review"
            ).length,
            reviewed: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Reviewed"
            ).length,
            submitted: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Submitted"
            ).length,
            closed: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Closed"
            ).length,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching submittals:", error);
        setError("Failed to load submittals. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, accountId]);

  //console.log("Submittals Data:", submittals);

  useEffect(() => {
    if (!submittals.length) {
      setStatusCounts({});
      setSpecCounts({});
      return;
    }

    const status = submittals.reduce((acc, sub) => {
      const key = sub.stateId || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    setStatusCounts(status);

    const specs = submittals.reduce((acc, sub) => {
      const title = sub.specDetails?.title || "Not Specified";
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {});
    setSpecCounts(specs);
  }, [submittals]);

  useEffect(() => {
    if (submittals.length === 0) {
      setFilteredSubmittals([]);
      return;
    }

    let updated = [...submittals];

    if (activeFilters.status) {
      updated = updated.filter((sub) => sub.stateId === activeFilters.status);
    }

    if (activeFilters.spec) {
      updated = updated.filter((sub) => {
        const specTitle = sub.specDetails?.title || "Unknown Spec";
        return specTitle === activeFilters.spec;
      });
    }

    setFilteredSubmittals(updated);
  }, [activeFilters, submittals]);

  const handleFilterClick = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: null,
      spec: null,
    });
  };

  const dataContainers = [
    {
      title: "Submittals Status Chart",
      content: statusCounts,
      chart: SubmittalsStatusChart,
      data: statusCounts,
      onClickName: (status) => handleFilterClick("status", status),
    },
    {
      title: "Submittals Spec Chart",
      content: specCounts,
      chart: SubmittalsSpecChart,
      data: specCounts,
      onClickName: (specTitle) => handleFilterClick("spec", specTitle),
    },
  ];

  const displayedSubmittals =
    filteredSubmittals.length > 0 ||
    Object.values(activeFilters).some((val) => val !== null)
      ? filteredSubmittals
      : submittals;

  if (loading) {
    return <BayerLoadingOverlay message="Loading project details..." />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <BayerAccMainLayout 
    projectId={projectId}
     accountId={accountId}
    >
      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          <span className="font-medium">Error!</span> {error}
        </div>
      )}

      {!submittals && !error && (
        <div
          className="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg"
          role="alert"
        >
          Submittals data could not be loaded.
        </div>
      )}

      {submittals && (
        <>
          <h1 className="text-2xl text-right font-bold mb-1 text-gray-800">
            RFIs Report Page
          </h1>
          <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
            {projectData.name}
          </h2>

          <hr className="my-4 border-t border-gray-300" />

          <div className="mb-4 text-right space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex max-h-[700px]">
            {/* Slider (1/4) */}
            <div className="w-1/4 bg-gray-50 mr-4 rounded-lg shadow-md chart-with-dots">
              <Slider {...reportsSliderSettings()}>
                {dataContainers.map((container, index) => (
                  <div key={index} className="p-4 h-[600px]">
                    <h2 className="text-xl font-bold mt-4 p-6">
                      {container.title}
                    </h2>
                    <hr className="border-gray-300 mb-1 text-xs" />

                    <container.chart
                      data={container.data}
                      onSliceClick={container.onClickName}
                    />

                    <div
                      className="text-xs mt-1 h-40 overflow-y-auto"
                      style={{ maxHeight: "450px" }}
                    >
                      <h3 className="font-semibold mb-3">Totals:</h3>
                      <hr className="border-gray-300 mb-1 text-xs" />
                      {Object.entries(container.content).map(([key, val]) => (
                        <p key={key}>{`${key}: ${val}`}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </Slider>
            </div>

            {/* Tabla (3/4) */}
            <div className="w-3/4 bg-white gap-4 mb-4 p-4 rounded-lg shadow-md overflow-y-auto h-[700px]">
              <SubmittalsTable
                submittals={displayedSubmittals}
                onViewDetails={(id) => handleFilterClick(id)()}
              />
            </div>
          </div>
        </>
      )}
    </BayerAccMainLayout>
  );
};

export default React.memo(AccProjectSubmittalsPage);
