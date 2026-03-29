import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchBim360ProjectCompanies,
  fetchBim360ProjectData,
} from "../../pages/services/bim360.services.js";

import ExcelJS from "exceljs";

const Bim360ProjectCompaniesPage = () => {
  const { projectId, accountId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchBim360ProjectCompanies(projectId, accountId),
      fetchBim360ProjectData(projectId, accountId),
    ])
      .then(([companiesData, project]) => {
        if (project) setProjectData(project);
        if (companiesData?.companies) setCompanies(companiesData.companies);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load companies. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.trade?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q)
    );
  });

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Companies");

    worksheet.columns = [
      { width: 5 },
      { width: 35 },
      { width: 25 },
      { width: 20 },
      { width: 35 },
      { width: 40 },
    ];

    const fetchBase64Image = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    const base64Logo = await fetchBase64Image(
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Logo_Bayer.svg"
    );
    const logoId = workbook.addImage({ base64: base64Logo, extension: "svg" });
    worksheet.addImage(logoId, { tl: { col: 5, row: 1 }, ext: { width: 75, height: 75 } });

    worksheet.getCell("B2").value = "BAYER COMPANIES REPORT";
    worksheet.getCell("B2").font = { bold: true, size: 14 };
    worksheet.getCell("B3").value = projectData?.name || "";
    worksheet.getCell("B3").font = { bold: true };
    worksheet.getCell("B4").value = new Date().toLocaleDateString();
    worksheet.getCell("B4").font = { bold: true };

    const headers = ["Company Name", "Trade", "Country", "Website", "Description"];
    headers.forEach((col, index) => {
      const cell = worksheet.getCell(6, index + 2);
      cell.value = col;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00BCFF" } };
    });

    companies.forEach((c, rowIndex) => {
      const row = [
        c.name || "",
        c.trade || "",
        c.country || "",
        c.website_url || "",
        c.description || "",
      ];
      row.forEach((value, colIndex) => {
        worksheet.getCell(rowIndex + 7, colIndex + 2).value = value;
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Companies_Report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  if (loading) return <BayerLoadingOverlay message="Loading companies..." />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <BayerBim360MainLayout projectId={projectId} accountId={accountId}>
      <h1 className="text-2xl font-bold text-right mb-1">Companies Report</h1>
      <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
        {projectData?.name}
      </h2>
      <hr className="my-4 border-gray-300" />

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name, trade or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="space-x-2">
          <button
            onClick={exportToExcel}
            className="btn-primary text-xs font-bold py-2 px-4 rounded"
          >
            Export to Excel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-bold rounded hover:bg-gray-300"
          >
            Print / Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-600 text-white text-xs uppercase">
              <th className="px-4 py-3 text-left">Company Name</th>
              <th className="px-4 py-3 text-left">Trade</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Website</th>
              <th className="px-4 py-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No companies found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="odd:bg-white even:bg-gray-50 border-b last:border-b-0">
                  <td className="px-4 py-2 font-medium">{c.name || "—"}</td>
                  <td className="px-4 py-2">{c.trade || "—"}</td>
                  <td className="px-4 py-2">{c.country || "—"}</td>
                  <td className="px-4 py-2">
                    {c.website_url ? (
                      <a
                        href={c.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-xs block"
                      >
                        {c.website_url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                    {c.description || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-right">
        {filtered.length} of {companies.length} companies
      </p>
    </BayerBim360MainLayout>
  );
};

export default React.memo(Bim360ProjectCompaniesPage);
