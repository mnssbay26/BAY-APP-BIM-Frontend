import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import BayerAccMainLayout from "@/components/platform_general_components/acc_components/acc.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchAccProjectUsers,
  fetchAccProjectData,
} from "../../pages/services/acc.services.js";

import BarChart_NivoCompanyUsers from "../../components/users_componets/company.bar.chart.jsx";
import BarChart_NivoRoleUsers from "../../components/users_componets/role.bar.chart.jsx";
import UsersTable from "../../components/users_componets/users.table.jsx";

import ExcelJS from "exceljs";

const AccProjectUsersPage = () => {
  // Get projectId and accountId from URL parameters
  const { projectId, accountId } = useParams();
  const [cookies] = useState(document.cookie);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for project data and users
  const [projectData, setProjectData] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [companyCounts, setCompanyCounts] = useState({});
  const [roleCounts, setRoleCounts] = useState({});
  const [notSpecifiedCompanyCount, setNotSpecifiedCompanyCount] = useState(0);
  const [notSpecifiedRoleCount, setNotSpecifiedRoleCount] = useState(0);

  // State for filtered users and selected filters
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAccProjectUsers(projectId, accountId),
      fetchAccProjectData(projectId, accountId, cookies),
    ])
      .then(([usersData, projectData]) => {
        const companies = {};
        const roles = {};
        let notSpecifiedCompanyCount = 0;
        let notSpecifiedRoleCount = 0;

        if (projectData) {
          setProjectData(projectData);
        }

        if (usersData && usersData.users) {
          setUsers(usersData.users);
        }
        if (usersData && usersData.users) {
          setTotalUsers(usersData.users.length);
        }

        usersData.users.forEach((user) => {
          if (user.companyName) {
            companies[user.companyName] =
              (companies[user.companyName] || 0) + 1;
          } else {
            notSpecifiedCompanyCount++;
          }

          if (user.roles) {
            user.roles.forEach((role) => {
              roles[role.name] = (roles[role.name] || 0) + 1;
            });
          } else {
            notSpecifiedRoleCount++;
          }
        });
        setCompanyCounts(companies);
        setNotSpecifiedCompanyCount(notSpecifiedCompanyCount);
        setNotSpecifiedRoleCount(notSpecifiedRoleCount);
        setRoleCounts(roles);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, accountId, cookies]);

  useEffect(() => {
    let filtered = users;

    if (selectedCompany) {
      filtered = filtered.filter(
        (user) => user.companyName === selectedCompany
      );
    }

    if (selectedRole) {
      filtered = filtered.filter((user) =>
        user.roles.some((role) => role.name === selectedRole)
      );
    }

    setFilteredUsers(filtered);
  }, [users, selectedCompany, selectedRole]);

  // Handle role click
  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  // Handle company click
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
  };

  // Reset filters
  const resetFilters = () => {
    setFilteredUsers(users);
    setSelectedCompany(null);
    setSelectedRole(null);
  };

  // Export data to Excel
  const exportToExcel = async () => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Set column widths
    worksheet.columns = [
      { width: 5 },
      { width: 30 },
      { width: 30 },
      { width: 15 },
      { width: 25 },
      { width: 40 },
    ];

    // Download logo image as Base64
    const fetchBase64Image = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]); // Remove prefix
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    const base64Logo = await fetchBase64Image(
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Logo_Bayer.svg"
    );

    // Add logo image to workbook
    const logoId = workbook.addImage({
      base64: base64Logo,
      extension: "svg",
    });

    worksheet.addImage(logoId, {
      tl: { col: 5, row: 1 },
      ext: { width: 75, height: 75 },
    });

    // Write title in cell B2
    worksheet.getCell("B2").value = "BAYER USERS REPORT";
    worksheet.getCell("B2").font = { bold: true, size: 14 };

    // Write project name in cell B3
    worksheet.getCell("B3").value =
      projectData.name || "No project name available";
    worksheet.getCell("B3").font = { bold: true };

    // Write date in cell B4
    worksheet.getCell("B4").value = new Date().toLocaleDateString();
    worksheet.getCell("B4").font = { bold: true };

    // Write headers in row 6
    const header = ["Name", "Email", "Status", "Company", "Roles"];
    header.forEach((col, index) => {
      const cell = worksheet.getCell(6, index + 2);
      cell.value = col;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00BCFF" },
      };
    });

    // Write user data starting from row 7
    users.forEach((user, rowIndex) => {
      const data = [
        user.name,
        user.email,
        user.status,
        user.companyName || "Not specified",
        user.roles.length > 0
          ? user.roles.map((role) => role.name).join(", ")
          : "Not specified",
      ];
      data.forEach((value, colIndex) => {
        const cell = worksheet.getCell(rowIndex + 7, colIndex + 2);
        cell.value = value;
      });
    });

    // Download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Users_Report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUsers = () => {
    exportToExcel(filteredUsers, `project-${projectId}-users.xlsx`);
  };

  if (loading) {
    return <BayerLoadingOverlay message="Loading project details..." />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  console.debug("users:", users);
  console.debug("Role Counts:", roleCounts);
  console.debug("Company Data:", companyCounts);

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

      {!users && !error && (
        <div
          className="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg"
          role="alert"
        >
          Project data could not be loaded.
        </div>
      )}

      {users && (
        <>
          <h1 className="text-2xl text-right font-bold mb-1 text-gray-800">
            Project Users Report
          </h1>
          <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
            {projectData.name}
          </h2>

          <hr className="my-4 border-t border-gray-300" />

          {/* Charts*/}
          <div className="flex flex-wrap -mx-4 mt-4">
            {/* First block: total users */}
            <div className="w-full md:w-1/5 px-4 mb-4 h-[400px]">
              <div className="h-64 w-full bg-gray-50 rounded shadow flex flex-col items-center justify-center h-[400px]">
                <h3 className="text-lg">Total Users</h3>
                <p className="text-6xl font-bold text-blue-600 mt-2">
                  {totalUsers}
                </p>
              </div>
            </div>

            {/* Second block: Company Chart */}
            <div className="w-full md:w-2/5 px-4 mb-4 h-[400px]">
              <div className="h-full bg-white rounded shadow p-4">
                <h3 className="text-lg mb-2">Company Chart</h3>
                <hr className="my-4 border-1 borde1-gray-300" />
                <BarChart_NivoCompanyUsers
                  companyCounts={companyCounts}
                  onCompanyClick={handleCompanyClick}
                />
              </div>
            </div>

            {/* Third block: Role Chart */}
            <div className="w-full md:w-2/5 px-4 mb-4 h-[400px]">
              <div className="h-full bg-white rounded shadow p-4">
                <h3 className="text-lg mb-2">Role Chart</h3>
                <hr className="my-4 border-1 borde1-gray-300" />
                <BarChart_NivoRoleUsers
                  roleCounts={roleCounts}
                  onRoleClick={handleRoleClick}
                />
              </div>
            </div>
          </div>

          {/* Table and buttons*/}
          <div className="w-full mt-4">
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleExportUsers}
                className="btn-primary text-xs font-bold py-2 px-4 rounded mb-4 "
              >
                Export Users to Excel
              </button>
              <button
                onClick={resetFilters}
                className="btn-primary text-xs font-bold py-2 px-4 rounded mb-4 "
              >
                Reset Chart Filters
              </button>
            </div>

            <hr className="my-2 border-t border-gray-300" />

            <UsersTable users={filteredUsers} />
          </div>
        </>
      )}
    </BayerAccMainLayout>
  );
};

export default React.memo(AccProjectUsersPage);
