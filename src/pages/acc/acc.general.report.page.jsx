import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { fetchAccProjectsData } from "../../pages/services/acc.services.js";

import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";
import PlatformHeader from "@/components/platform_general_components/general_platform_components/platform.access.header.jsx";
import DashboardContent from "@/components/general_report_components/dashboard.content.jsx";
import DashboardMetrics from "@/components/general_report_components/dashboard.metrics.jsx";
import { useDashboardData } from "@/components/general_report_components/hooks/useDashboardData";
import { Badge } from "@/components/ui/badge";
import { Building2, Activity, ArrowLeft } from "lucide-react";

const AccGeneralReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialProjects = location.state?.projects ? 
    location.state.projects.filter(project => 
      project.platform === "acc" && project.status === "active"
    ) : [];

  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(!location.state?.projects);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location.state?.projects) {
      setLoading(true);
      setError(null);
      
      fetchAccProjectsData()
        .then((data) => {
          if (data && Array.isArray(data)) {
            // ✅ Filtrar solo proyectos ACC y activos
            const accProjects = data.filter(project => 
              project.platform === "acc" && project.status === "active"
            );
            
            console.log("All Projects Data:", data);
            console.log("Filtered ACC Projects for Dashboard:", accProjects);
            console.log(`Dashboard showing ${accProjects.length} ACC active projects from ${data.length} total projects`);
            setProjects(accProjects);
          } else {
            setProjects([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching ACC projects:", error);
          setError("Failed to load projects data");
          // Opcional: redirect a projects page después de un delay
          setTimeout(() => {
            navigate('/acc/projects');
          }, 3000);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location.state, navigate]);

  const {
    selectedCountry,
    setSelectedCountry,
    selectedStatus,
    setSelectedStatus,
    countries,
    statuses,
    filteredProjects,
    metrics,
    chartData,
  } = useDashboardData(projects);

  
  if (loading) {
    return <BayerLoadingOverlay message="Loading dashboard data..." />;
  }

  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <PlatformHeader />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#2ea3e3] text-white px-4 py-2 rounded-md hover:bg-[#10384f] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/acc/projects')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  if (!projects.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <PlatformHeader />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No project data available</h1>
          <p className="text-gray-600 mb-4">
            No ACC projects were found. Please check your access permissions.
          </p>
          <button
            onClick={() => navigate('/acc/projects')}
            className="bg-[#2ea3e3] text-white px-4 py-2 rounded-md hover:bg-[#10384f] transition-colors"
          >
            Back to ACC Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PlatformHeader />
      
      {/* Header integrado */}
      <div className="pt-16 border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/acc/projects')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Projects
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2" />
              <Building2 className="h-8 w-8" style={{ color: "#00bcff" }} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ACC Executive Dashboard</h1>
                <p className="text-sm text-gray-600">Project Management & Executive Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm bg-blue-50 border-blue-200 text-blue-700">
                <Activity className="h-4 w-4 mr-1" />
                {projects.length} Total Projects
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-6">
       
        <DashboardMetrics
          metrics={metrics}
          countries={countries}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statuses={statuses}
          filteredProjects={filteredProjects}
        />

        <DashboardContent
          filteredProjects={filteredProjects}
          chartData={chartData}
        />
      </div>
    </div>
  );
};

export default React.memo(AccGeneralReportPage);