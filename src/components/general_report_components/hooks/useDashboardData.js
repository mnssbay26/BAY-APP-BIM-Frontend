import { useState, useMemo } from "react";

export const useDashboardData = (projects) => {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Get unique values
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(projects.map((p) => p.country))].filter(Boolean);
    return uniqueCountries.sort();
  }, [projects]);

  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(projects.map((p) => p.status))].filter(Boolean);
    return uniqueStatuses.sort();
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (selectedCountry !== "all") {
      filtered = filtered.filter((p) => p.country === selectedCountry);
    }
    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }
    return filtered;
  }, [projects, selectedCountry, selectedStatus]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const activeProjects = filteredProjects.filter((p) => p.status === "active").length;
    const totalMembers = filteredProjects.reduce((sum, p) => sum + (p.memberCount || 0), 0);
    const totalCompanies = filteredProjects.reduce((sum, p) => sum + (p.companyCount || 0), 0);
    const totalValue = filteredProjects.reduce((sum, p) => sum + (p.projectValue?.value || 0), 0);

    return {
      totalProjects,
      activeProjects,
      totalMembers,
      totalCompanies,
      totalValue,
    };
  }, [filteredProjects]);

  // Chart data calculations
  const chartData = useMemo(() => {
    // Construction types
    const constructionTypeData = filteredProjects.reduce((acc, project) => {
      const type = project.type || project.constructionType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const constructionTypes = Object.entries(constructionTypeData).map(([type, count]) => ({
      type,
      count,
      value: filteredProjects
        .filter((p) => (p.type || p.constructionType) === type)
        .reduce((sum, p) => sum + (p.projectValue?.value || 0), 0),
    }));

    // Product usage
    const productCount = {};
    filteredProjects.forEach((project) => {
      if (project.products && Array.isArray(project.products)) {
        project.products.forEach((product) => {
          const productName = product.name || product.key || product;
          if (typeof productName === 'string') {
            productCount[productName] = (productCount[productName] || 0) + 1;
          }
        });
      }
    });

    const productUsageData = Object.entries(productCount)
      .map(([product, count]) => ({
        product: product.replace("BIM360 ", "").replace(" Management", ""),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Status data
    const statusData = filteredProjects.reduce((acc, project) => {
      const status = project.status || "Unknown";
      if (!acc[status]) {
        acc[status] = { status, count: 0, members: 0, companies: 0 };
      }
      acc[status].count += 1;
      acc[status].members += project.memberCount || 0;
      acc[status].companies += project.companyCount || 0;
      return acc;
    }, {});

    // Country data
    const countryData = filteredProjects.reduce((acc, project) => {
      const country = project.country || "Unknown";
      if (!acc[country]) {
        acc[country] = { country, projects: 0, totalValue: 0, members: 0, companies: 0 };
      }
      acc[country].projects += 1;
      acc[country].totalValue += project.projectValue?.value || 0;
      acc[country].members += project.memberCount || 0;
      acc[country].companies += project.companyCount || 0;
      return acc;
    }, {});

    return {
      constructionTypes,
      productUsageData,
      statusData: Object.values(statusData),
      countryData: Object.values(countryData),
    };
  }, [filteredProjects]);

  return {
    selectedCountry,
    setSelectedCountry,
    selectedStatus,
    setSelectedStatus,
    countries,
    statuses,
    filteredProjects,
    metrics,
    chartData,
  };
};