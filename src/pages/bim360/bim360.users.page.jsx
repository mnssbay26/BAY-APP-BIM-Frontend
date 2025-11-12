import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchBim360ProjectData,
  fetchBim360ProjectUsers,
} from "../../pages/services/bim360.services";

import BarChart_NivoCompanyUsers from "../../components/users_componets/company.bar.chart.jsx";
import BarChart_NivoRoleUsers from "../../components/users_componets/role.bar.chart.jsx";
import UsersTable from "../../components/users_componets/users.table.jsx";

import ExcelJS from "exceljs";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const sampleQuestions = [
  "How many users belong to each company?",
  "List users with no roles assigned.",
  "What percentage of users are inactive?",
  "Which users have both 'Admin' and 'Viewer' roles?",
  "Show me the top 3 companies by user count.",
];

/* ===================== CHAT RENDER HELPERS (v2) ===================== */
const prettyCompany = (c) =>
  c == null || c === "null" ? "Not specified" : String(c).replace(/_+/g, " ").trim();

const isCompanyCountArray = (v) =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every((x) => x && typeof x === "object" && "company" in x && "count" in x);

const isUsersSlimArray = (v) =>
  Array.isArray(v) &&
  v.length >= 0 &&
  v.every(
    (u) =>
      u && typeof u === "object" && "id" in u && "name" in u && "companyName" in u
  );

function ChatMessageContent({ value }) {
  if (value == null) return null;

  const t = typeof value;
  if (t === "string") return <span className="whitespace-pre-wrap">{value}</span>;
  if (t === "number" || t === "boolean")
    return <span className="font-mono">{String(value)}</span>;

  // Arrays
  if (Array.isArray(value)) {
    if (value.length === 0)
      return <em className="text-gray-500">No results.</em>;

    // [{ company, count }]
    if (isCompanyCountArray(value)) {
      const max = Math.max(...value.map((r) => Number(r.count) || 0));
      return (
        <div className="text-sm">
          <div className="grid grid-cols-12 font-semibold border-b pb-1 mb-1">
            <div className="col-span-1">#</div>
            <div className="col-span-8">Company</div>
            <div className="col-span-3 text-right">Count</div>
          </div>
          {value.map((r, idx) => {
            const w = max ? Math.round(((Number(r.count) || 0) / max) * 100) : 0;
            return (
              <div
                key={`${r.company ?? "null"}-${idx}`}
                className="grid grid-cols-12 items-center py-1 border-b last:border-b-0"
              >
                <div className="col-span-1 text-gray-500">{idx + 1}</div>
                <div className="col-span-8">
                  <div className="truncate">{prettyCompany(r.company)}</div>
                  <div className="h-1 bg-gray-200 rounded mt-1">
                    <div
                      className="h-1 rounded"
                      style={{ width: `${w}%`, backgroundColor: "#60a5fa" }}
                    />
                  </div>
                </div>
                <div className="col-span-3 text-right font-mono">{r.count}</div>
              </div>
            );
          })}
        </div>
      );
    }

    // [{ id, name, companyName }]
    if (isUsersSlimArray(value)) {
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-2">Name</th>
              <th className="text-left py-1 pr-2">Company</th>
              <th className="text-left py-1 pr-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {value.map((u, i) => (
              <tr key={u.id || i} className="border-b last:border-b-0">
                <td className="py-1 pr-2">{u.name}</td>
                <td className="py-1 pr-2">{prettyCompany(u.companyName)}</td>
                <td className="py-1 pr-2 text-gray-500 font-mono">{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // Fallback elegante
    return (
      <pre className="whitespace-pre-wrap break-words text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  // Objetos sueltos -> fallback JSON legible
  return (
    <pre className="whitespace-pre-wrap break-words text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
/* ==================================================================== */

const Bim360ProjectUsersPage = () => {
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

  // chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchBim360ProjectUsers(projectId, accountId),
      fetchBim360ProjectData(projectId, accountId, cookies),
    ])
      .then(([usersData, projectData]) => {
        const companies = {};
        const roles = {};
        let notSpecifiedCompanyCount = 0;
        let notSpecifiedRoleCount = 0;

        if (projectData) setProjectData(projectData);

        if (usersData && usersData.users) {
          setUsers(usersData.users);
          setTotalUsers(usersData.users.length);

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
        }

        setCompanyCounts(companies);
        setNotSpecifiedCompanyCount(notSpecifiedCompanyCount);
        setNotSpecifiedRoleCount(notSpecifiedRoleCount);
        setRoleCounts(roles);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again later.");
      })
      .finally(() => setLoading(false));
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
  const handleRoleClick = (role) => setSelectedRole(role);

  // Handle company click
  const handleCompanyClick = (company) => setSelectedCompany(company);

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
      projectData?.name || "No project name available";
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
    exportToExcel(); // usa el dataset actual; cambia si quieres filtrar
  };

  // chat handlers
  useEffect(() => {
    if (conversationRef.current)
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen((open) => {
      if (!open && messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Hi! Ask me anything about project users.",
          },
        ]);
      }
      return !open;
    });
  };

  const handleSendMessage = async () => {
    const text = userMessage.trim();
    if (!text || isSendingMessage) return;
    setIsSendingMessage(true);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setUserMessage("");
    try {
      const res = await fetch(`${backendUrl}/ai/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          projectId,
          service: "users",
          question: text,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { answer } = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: answer ?? "No answer" },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSampleQuestionClick = (q) => setUserMessage(q);

  if (loading) {
    return <BayerLoadingOverlay message="Loading project details..." />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <BayerBim360MainLayout projectId={projectId} accountId={accountId}>
      <h1 className="text-2xl text-right font-bold mb-1 text-gray-800">
        Project Users Report
      </h1>
      <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
        {projectData?.name}
      </h2>
      <hr className="my-4 border-t border-gray-300" />

      {/* Top Controls */}
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={handleExportUsers}
          className="btn-primary text-xs font-bold py-2 px-4 rounded"
        >
          Export to Excel
        </button>
        {!isChatOpen && (
          <button
            onClick={resetFilters}
            className="btn-primary text-xs font-bold py-2 px-4 rounded"
          >
            Reset Chart Filters
          </button>
        )}
        <button
          onClick={toggleChat}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isChatOpen ? "Show Users Table" : "Ask AI Assistant"}
        </button>
      </div>

      {/* Charts + Totals */}
      <div className="flex flex-wrap -mx-4 mb-8">
        {/* Total Users */}
        <div className="w-full md:w-1/5 px-4 mb-4">
          <div className="h-64 bg-gray-50 rounded shadow flex flex-col items-center justify-center">
            <h3 className="text-lg">Total Users</h3>
            <p className="text-6xl font-bold text-blue-600 mt-2">
              {totalUsers}
            </p>
          </div>
        </div>
        {/* Company Chart */}
        <div className="w-full md:w-2/5 px-4 mb-4">
          <div className="h-64 bg-white rounded shadow p-4">
            <h3 className="text-lg mb-2">Company Chart</h3>
            <BarChart_NivoCompanyUsers
              companyCounts={companyCounts}
              onCompanyClick={handleCompanyClick}
            />
          </div>
        </div>
        {/* Role Chart */}
        <div className="w-full md:w-2/5 px-4 mb-4">
          <div className="h-64 bg-white rounded shadow p-4">
            <h3 className="text-lg mb-2">Role Chart</h3>
            <BarChart_NivoRoleUsers
              roleCounts={roleCounts}
              onRoleClick={handleRoleClick}
            />
          </div>
        </div>
      </div>

      {/* Chat or Table */}
      <section className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[600px]">
        {isChatOpen ? (
          <>
            <div
              ref={conversationRef}
              className="mb-4 max-h-96 overflow-y-auto border p-3 bg-gray-50 rounded"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    style={{ maxWidth: "80%", whiteSpace: "pre-wrap" }}
                  >
                    <strong className="block mb-1">
                      {msg.role === "user" ? "You" : "Assistant"}
                    </strong>
                    <ChatMessageContent value={msg.content} />
                  </div>
                </div>
              ))}
              {isSendingMessage && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg bg-gray-200 italic">
                    Assistant is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Try:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSampleQuestionClick(q)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    disabled={isSendingMessage}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-grow border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                disabled={isSendingMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSendingMessage || !userMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {isSendingMessage ? "..." : "Send"}
              </button>
            </div>
          </>
        ) : (
          <UsersTable users={filteredUsers} />
        )}
      </section>
    </BayerBim360MainLayout>
  );
};

export default React.memo(Bim360ProjectUsersPage);
