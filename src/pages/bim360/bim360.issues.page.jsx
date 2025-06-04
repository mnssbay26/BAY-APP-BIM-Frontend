import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchBim360ProjectIssues,
  fetchBim360ProjectData,
} from "../../pages/services/bim360.services";

import IssuesTable from "../../components/issues_components/issues.table.jsx";
import DonutChartGeneric from "../../components/issues_components/issues.generc.chart.jsx";

import { reportsSliderSettings } from "../utils/project.slider.settings.utils.js";

const Bim360ProjectIssuesPage = () => {
  const { projectId, accountId } = useParams();
  const [cookies] = useState(document.cookie);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to hold project data and issues
  const [projectData, setProjectData] = useState(null);
  const [issues, setIssues] = useState([]);

  // State to hold active filters
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    issueTypeName: null,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchBim360ProjectIssues(projectId, accountId),
      fetchBim360ProjectData(projectId, accountId),
    ])
      .then(([issuesData, projectData]) => {
        if (projectData) {
          setProjectData(projectData);
        }

        if (issuesData && issuesData.issues) {
          setIssues(issuesData.issues);
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

  const itemsCounts = (list, key) => {
    const counts = {};
    list.forEach((item) => {
      const k = key(item);
      if (!k) return;
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  };

  const { chartsData, customTitles } = useMemo(() => {
    if (!issues || issues.length === 0)
      return {
        chartsData: { status: {}, type: {}, custom: {} },
        customTitles: [],
      };

    const status = itemsCounts(issues, (i) => i.status);
    const type = itemsCounts(issues, (i) => i.issueTypeName);

    const custom = {};
    issues.forEach((i) =>
      i.customAttributes?.forEach((a) => {
        if (!custom[a.title]) custom[a.title] = {};
        const key = a.readableValue || "Not Specified";
        custom[a.title][key] = (custom[a.title][key] || 0) + 1;
      })
    );
    return {
      chartsData: { status, type, custom },
      customTitles: Object.keys(custom),
    };
  }, [issues]);

  const displayedIssues = useMemo(() => {
    let list = issues;
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return;
      list = list.filter((issue) => {
        if (key === "status" || key === "issueTypeName") {
          return issue[key] === value;
        } else {
          return issue.customAttributes?.some((attr) => {
            const val = attr.readableValue || "Not Specified";
            return attr.title.toLowerCase() === val;
          });
        }
      });
    });
    return list;
  }, [issues, activeFilters]);

  const handleFilterClick = (filterKey, value) =>
    setActiveFilters((prev) => ({ ...prev, [filterKey]: value }));

  const resetFilters = () =>
    setActiveFilters({ status: null, issueTypeName: null });

  const dataContainers = useMemo(() => {
    if (!chartsData) return [];

    return [
      {
        title: "Issue Status Chart",
        data: chartsData.status,
        filterKey: "status",
      },
      {
        title: "Issue Type Chart ",
        data: chartsData.type,
        filterKey: "issueTypeName",
      },
      ...Object.entries(chartsData.custom).map(([t, d]) => ({
        title: t,
        data: d,
        filterKey: t.toLowerCase(),
      })),
    ];
  }, [chartsData]);

  if (loading) {
    return <BayerLoadingOverlay message="Loading project details..." />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }
  return (
    <BayerBim360MainLayout 
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

      {!issues && !error && (
        <div
          className="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg"
          role="alert"
        >
          Issues data could not be loaded.
        </div>
      )}

      {issues && (
        <>
          <h1 className="text-2xl text-right font-bold mb-1 text-gray-800">
            Project Issues Report
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
                      <DonutChartGeneric
                        counts={c.data}
                        onSliceClick={(v) => handleFilterClick(c.filterKey, v)}
                      />
                      <div className="text-xs mt-1 h-40 overflow-y-auto">
                        <h3 className="font-semibold mb-1">Totals:</h3>
                        <hr className="border-gray-300 mb-1 text-xs" />
                        {Object.entries(c.data).map(([k, v]) => (
                          <p key={k}>{`${k}: ${v}`}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </Slider>
              </section>

              {/* Tabla */}
              <section className="w-3/4 bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[775px]">
                <IssuesTable
                  issues={displayedIssues}
                  customColumns={customTitles}
                />
              </section>
            </div>
          </div>
        </>
      )}
    </BayerBim360MainLayout>
  );
};

export default React.memo(Bim360ProjectIssuesPage);
