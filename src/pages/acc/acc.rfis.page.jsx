import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BayerAccMainLayout from "@/components/platform_general_components/acc_components/acc.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchAccProjectData,
  fetchAccProjectRfis,
} from "../../pages/services/acc.services.js";

import RFITable from "../../components/rfis_components/acc.rfis.table.jsx";
import RFIsDisciplineChart from "../../components/rfis_components/acc.rfis.discipline.chart.jsx";
import RFIsPriorityChart from "../../components/rfis_components/acc.rfis.priority.chart.jsx";
import RFIsStatusChart from "../../components/rfis_components/acc.rfis.status.chart.jsx";

import { reportsSliderSettings } from "../utils/project.slider.settings.utils.js";

const AccProjectRfisPage = () => {
  // Extract projectId and accountId from URL parameters
  const { projectId, accountId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to hold project data and issues
  const [projectData, setProjectData] = useState(null);
  const [rfis, setRfis] = useState([]);
  const [rfiTotals, setRfisTotals] = useState({
    total: 0,
    open: 0,
    answered: 0,
    closed: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    open: 0,
    answered: 0,
    closed: 0,
  });
  const [priorityCounts, setPriorityCounts] = useState({
    high: 0,
    normal: 0,
    low: 0,
  });
  const [disciplineCounts, setDisciplineCounts] = useState({});

  // State to hold active filters
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    priority: null,
    discipline: null,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAccProjectRfis(projectId, accountId),
      fetchAccProjectData(projectId, accountId),
    ])
      .then(([rfisData, projectData]) => {
        if (projectData) {
          setProjectData(projectData);
        }

        if (rfisData && rfisData.rfis) {
          setRfis(rfisData.rfis);
        }
        if (rfisData && rfisData.rfis) {
          setRfisTotals({
            total: rfisData.rfis.length,
            open: rfisData.rfis.filter((rfi) => rfi.status === "open").length,
            answered: rfisData.rfis.filter((rfi) => rfi.status === "answered")
              .length,
            closed: rfisData.rfis.filter((rfi) => rfi.status === "closed")
              .length,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching RFIs:", error);
        setError("Failed to load RFIs. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, accountId]);

  useEffect(() => {
    const newStatus = { open: 0, answered: 0, closed: 0 };
    const newPriority = { high: 0, normal: 0, low: 0 };
    const newDiscipline = {};

    rfis.forEach((r) => {
      if (r.status === "open") newStatus.open++;
      if (r.status === "answered") newStatus.answered++;
      if (r.status === "closed") newStatus.closed++;

      const p = r.priority?.toLowerCase();
      if (p === "high") newPriority.high++;
      if (p === "normal") newPriority.normal++;
      if (p === "low") newPriority.low++;

      if (r.discipline) {
        newDiscipline[r.discipline] = (newDiscipline[r.discipline] || 0) + 1;
      }
    });

    setStatusCounts(newStatus);
    setPriorityCounts(newPriority);
    setDisciplineCounts(newDiscipline);
  }, [rfis]);

  const displayedRFIs = rfis
  .filter((r) =>
    !activeFilters.status
      ? true
      : r.status.toLowerCase() === activeFilters.status
  )
  .filter((r) =>
    !activeFilters.priority
      ? true
      : r.priority?.toLowerCase() === activeFilters.priority
  )
  .filter((r) =>
    !activeFilters.discipline
      ? true
      : r.discipline === activeFilters.discipline
  );

  const handleFilterClick = (type, val) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type] === val ? null : val,
    }));
  };

  const resetFilters = () => {
    setActiveFilters({ status: null, priority: null, discipline: null });
  };

  const dataContainers = [
    {
      title: "RFI Status Chart",
      chart: RFIsStatusChart,
      content: statusCounts,
      data: statusCounts,
      filterKey: "status",
      onClickName: (status) =>
        handleFilterClick("status", status.toLowerCase()),
    },
    {
      title: "RFI Priority Chart",
      chart: RFIsPriorityChart,
      content: priorityCounts,
      data: priorityCounts,
      filterKey: "priority",
      onClickName: (pr) => handleFilterClick("priority", pr),
    },
    {
      title: "RFI Discipline Chart",
      chart: RFIsDisciplineChart,
      content: disciplineCounts,
      data: disciplineCounts,
      filterKey: "discipline",
      onClickName: (d) => handleFilterClick("discipline", d),
    },
  ];

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

      {!rfis && !error && (
        <div
          className="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg"
          role="alert"
        >
          RFIs data could not be loaded.
        </div>
      )}

      {rfis && (
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

            <div className="flex max-h-[775px] mb-8">
              <section className="w-1/4 bg-gray-50 mr-4 rounded-lg shadow-md chart-with-dots">
                <Slider {...reportsSliderSettings()}>
                  {dataContainers.map((c) => (
                    <div
                      key={`${c.title}`}
                      className="text-xl font-bold mt-4 p-6"
                    >
                      <h2 className="text-lg mb-2">{c.title}</h2>
                      <hr className="border-gray-300 mb-1 text-xs" />

                      <c.chart
                        data={c.data}
                        onSliceClick={(v) => handleFilterClick(c.filterKey, v)}
                      />
                      <div className="text-xs mt-1 h-40 overflow-y-auto">
                        <h3 className="font-semibold mb-3">Totals:</h3>
                        <hr className="border-gray-300 mb-1 text-xs" />
                        {Object.entries(c.data).map(([k, v]) => (
                          <p key={k}>{`${k}: ${v}`}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </Slider>
              </section>

              {/* ────── RFIs Table ────── */}
              <section className="w-3/4 bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[775px]">
                <RFITable rfis={displayedRFIs} onViewDetails={() => {}} />
              </section>
            </div>
          </div>
        </>
      )}
    </BayerAccMainLayout>
  );
};

export default React.memo(AccProjectRfisPage);
