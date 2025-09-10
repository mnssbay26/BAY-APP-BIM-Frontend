import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";
import PlatformHeader from "@/components/platform_general_components/general_platform_components/platform.access.header.jsx"

import { fetchBim360ProjectsData } from "../../pages/services/bim360.services.js";

/**
 * Page for listing BIM360 projects and allowing navigation to details.
 * @returns {JSX.Element}
 */
const Bim360ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchBim360ProjectsData()])
      .then(([projectsData]) => {
        if (projectsData) {
          const bimProjects = projectsData.filter(project => 
            project.platform === "bim360" && project.status === "active"
          );

          //console.log("All Projects Data:", projectsData);
          //console.log("Filtered BIM 360 Projects:", bimProjects);
          //console.log(`Filtered ${bimProjects.length} BIM 360 active projects from ${projectsData.length} total projects`);

          setProjects(bimProjects);
        }
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <BayerLoadingOverlay message="Loading project details..." />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

   const handleGeneralReport = () => {
    navigate('/bim360/general-report', { state: { projects } });
  };

  const withB = (id = "") =>
  id.startsWith("b.") ? id : `b.${id.replace(/^[ab]\./, "")}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <PlatformHeader />

      <main className="container mx-auto flex flex-col md:flex-row items-center px-6 py-20 gap-10">
        {/* Left Column */}
        <div className="w-full md:w-1/2 space-y-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900">BAYER BIM APP</h1>
          <p className="text-2xl text-gray-700">
            Select your project to continue or review the general report
          </p>
          <button 
          onClick={handleGeneralReport}
          className="mt-6 bg-[#10384f] text-white text-lg font-semibold px-8 py-3 rounded-md shadow-lg hover:bg-[#2ea3e3] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
            General Report
          </button>
          {error && (
            <p className="text-red-600 mt-4">
              Oops, something went wrong: {error}
            </p>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2">
          <div className="h-[450px] overflow-y-auto">
            <ul className="space-y-4">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h2 className="text-base font-medium text-gray-900">
                      {project.name}
                    </h2>
                    
                    
                  </div>

                  <Link
                    to={`/bim360/projects/${withB(project.accountId)}/${withB(project.id)}`}
                    className="ml-4 bg-[#2ea3e3] text-white text-sm font-semibold px-3 py-1 rounded-md shadow hover:bg-slate-200 hover:text-black transition-colors"
                  >
                    Open project
                  </Link>
                </li>
              ))}
            </ul>

            {!error && projects.length === 0 && (
              <p className="text-gray-500 mt-4 text-center">
                No projects found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default React.memo(Bim360ProjectsPage);
