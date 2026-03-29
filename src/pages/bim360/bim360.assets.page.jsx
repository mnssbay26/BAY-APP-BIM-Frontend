import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { ResponsiveBar } from "@nivo/bar";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  getAssetsEnriched,
  getAssetsSummary,
} from "../../pages/services/acc.services.js";

import DonutChartGeneric from "../../components/issues_components/issues.generc.chart.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { reportsSliderSettings } from "../utils/project.slider.settings.utils.js";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const sampleQuestions = [
  "How many active assets are in this project?",
  "List all assets by category.",
  "Which assets have no barcode?",
  "What is the most common asset category?",
  "How many assets are inactive?",
  "Show me assets created in the last month.",
];

/* ------------ UI helpers for AI messages ------------ */
const fmt = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* noop */
  }
};

function renderAssistantContent(content) {
  if (Array.isArray(content)) {
    if (content.length === 0) return <em>Empty list</em>;
    if (typeof content[0] === "string" || typeof content[0] === "number") {
      return (
        <div>
          <div className="text-xs mb-2">
            <button
              onClick={() => copy(content.join(", "))}
              className="px-2 py-1 border rounded"
              title="Copy list"
            >
              Copy list
            </button>
          </div>
          <ul className="list-disc ml-5">
            {content.map((x, i) => (
              <li key={i}>{String(x)}</li>
            ))}
          </ul>
        </div>
      );
    }
    if (typeof content[0] === "object" && content[0] !== null) {
      const cols = Array.from(
        content.reduce((set, row) => {
          Object.keys(row || {}).forEach((k) => set.add(k));
          return set;
        }, new Set())
      );
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-100">
                {cols.map((c) => (
                  <th key={c} className="text-left px-2 py-1 border-b">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  {cols.map((c) => (
                    <td key={c} className="px-2 py-1 align-top border-b">
                      {fmt(row?.[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[10px] mt-1 text-gray-500">
            Rows: {content.length}
          </div>
        </div>
      );
    }
  }
  if (typeof content === "string") {
    const s = content.trim();
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        return renderAssistantContent(JSON.parse(s));
      } catch {
        /* fallthrough */
      }
    }
    return <span>{content}</span>;
  }
  if (typeof content === "object" && content !== null) {
    return (
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  }
  return <span>{String(content)}</span>;
}

/* ------------ Badge helpers ------------ */
const renderStatusBadge = (name = "") => (
  <Badge className="bg-blue-100 text-blue-800 hover:bg-[#164aa2] hover:text-white transition-colors">
    {name || "—"}
  </Badge>
);

const renderCategoryBadge = (name = "") => (
  <Badge className="bg-gray-100 text-gray-800 hover:bg-[#164aa2] hover:text-white transition-colors">
    {name || "—"}
  </Badge>
);

/* ------------ Assets Table ------------ */
function AssetsTable({ assets = [], loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    let res = [...assets];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      res = res.filter(
        (a) =>
          (a.clientAssetId ?? "").toLowerCase().includes(q) ||
          (a.categoryName ?? "").toLowerCase().includes(q) ||
          (a.statusName ?? "").toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q) ||
          (a.barcode ?? "").toLowerCase().includes(q)
      );
    }
    if (sortField) {
      res.sort((a, b) => {
        const av = (a[sortField] ?? "").toString();
        const bv = (b[sortField] ?? "").toString();
        return sortDirection === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      });
    }
    return res;
  }, [assets, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sortBy = (field) => {
    setSortDirection(
      sortField === field && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortField(field);
    setCurrentPage(1);
  };

  const sortIndicator = (field) =>
    sortField === field ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  const formatDate = (d) => (d ? d.split("T")[0] : "—");

  return (
    <Card className="w-full bg-white">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CardTitle className="text-xl font-bold">Assets List</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search assets…"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Button
              className="bg-[#e2e2e2] text-black hover:bg-[#2ea3e3] hover:text-white transition-colors shadow-sm"
              onClick={() => {
                setSearchTerm("");
                setSortField(null);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => sortBy("clientAssetId")}
                >
                  Asset ID {sortIndicator("clientAssetId")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => sortBy("categoryName")}
                >
                  Category {sortIndicator("categoryName")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => sortBy("statusName")}
                >
                  Status {sortIndicator("statusName")}
                </TableHead>
                <TableHead className="p-2 text-black hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="p-2 text-black">Active</TableHead>
                <TableHead className="p-2 text-black hidden lg:table-cell">
                  Attributes
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black hidden md:table-cell"
                  onClick={() => sortBy("createdAt")}
                >
                  Created {sortIndicator("createdAt")}
                </TableHead>
                <TableHead className="p-2 text-black hidden md:table-cell">
                  Barcode
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-8 text-center text-gray-500"
                  >
                    Loading assets...
                  </TableCell>
                </TableRow>
              ) : paginated.length ? (
                paginated.map((asset, idx) => (
                  <TableRow key={asset.id || idx} className="hover:bg-gray-50">
                    <TableCell className="p-2 text-xs">
                      {asset.clientAssetId || "—"}
                    </TableCell>
                    <TableCell className="p-2">
                      {asset.categoryName
                        ? renderCategoryBadge(asset.categoryName)
                        : "—"}
                    </TableCell>
                    <TableCell className="p-2">
                      {asset.statusName
                        ? renderStatusBadge(asset.statusName)
                        : "—"}
                    </TableCell>
                    <TableCell
                      className="p-2 hidden md:table-cell max-w-[200px] truncate"
                      title={asset.description || ""}
                    >
                      {asset.description
                        ? asset.description.length > 60
                          ? asset.description.slice(0, 60) + "…"
                          : asset.description
                        : "—"}
                    </TableCell>
                    <TableCell className="p-2">
                      {asset.isActive === false ? "❌" : "✅"}
                    </TableCell>
                    <TableCell className="p-2 hidden lg:table-cell">
                      {asset.customAttributesResolved?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {asset.customAttributesResolved
                            .slice(0, 3)
                            .map((attr, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-700 text-xs px-1 py-0.5 rounded"
                              >
                                {attr.name}: {String(attr.value ?? "—")}
                              </span>
                            ))}
                          {asset.customAttributesResolved.length > 3 && (
                            <span
                              className="bg-gray-200 text-gray-600 text-xs px-1 py-0.5 rounded cursor-help"
                              title={asset.customAttributesResolved
                                .slice(3)
                                .map(
                                  (a) => `${a.name}: ${String(a.value ?? "—")}`
                                )
                                .join("\n")}
                            >
                              +{asset.customAttributesResolved.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="p-2 hidden md:table-cell">
                      {formatDate(asset.createdAt)}
                    </TableCell>
                    <TableCell className="p-2 hidden md:table-cell text-xs">
                      {asset.barcode || "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-8 text-center text-gray-500"
                  >
                    No assets found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {paginated.length} of {filtered.length} assets
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------ Page ------------ */
const Bim360ProjectAssetsPage = () => {
  const { projectId, accountId } = useParams();

  const [assetsData, setAssetsData] = useState({ results: [], meta: {} });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    filterCategoryId: "",
    filterStatusId: "",
    filterIsActive: "",
  });

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

  // useEffect #1 — summary (solo al montar)
  useEffect(() => {
    setSummaryLoading(true);
    getAssetsSummary(accountId, projectId)
      .then((data) => setSummary(data))
      .catch((err) => console.error("Error fetching assets summary:", err))
      .finally(() => setSummaryLoading(false));
  }, [accountId, projectId]);

  // useEffect #2 — assets (se re-ejecuta con filters)
  useEffect(() => {
    if (!accountId || !projectId) return;
    setLoading(true);
    setError(null);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    getAssetsEnriched(accountId, projectId, params)
      .then((data) => setAssetsData({ results: data.results || [], meta: data.meta || {} }))
      .catch((err) => {
        console.error("Error fetching assets:", err);
        setError("Failed to load assets. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [accountId, projectId, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ filterCategoryId: "", filterStatusId: "", filterIsActive: "" });
  };

  // Charts data transformation
  const statusChartData = useMemo(
    () =>
      (summary?.byStatus || []).reduce((acc, s) => {
        acc[s.statusName] = s.count;
        return acc;
      }, {}),
    [summary]
  );

  const categoryChartData = useMemo(
    () =>
      [...(summary?.byCategory || [])]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    [summary]
  );

  const activeChartData = useMemo(
    () =>
      summary
        ? { Active: summary.activeAssets, Inactive: summary.inactiveAssets }
        : {},
    [summary]
  );

  const handleStatusChartClick = (sliceName) => {
    const found = summary?.byStatus?.find((s) => s.statusName === sliceName);
    if (found) handleFilterChange("filterStatusId", found.statusId);
  };

  const dataContainers = useMemo(
    () => [
      {
        title: "Assets by Status",
        chart: (
          <DonutChartGeneric
            counts={statusChartData}
            onSliceClick={handleStatusChartClick}
          />
        ),
        legendData: statusChartData,
      },
      {
        title: "Assets by Category (Top 10)",
        chart: (
          <div style={{ height: 380 }}>
            <ResponsiveBar
              data={categoryChartData.map((c) => ({
                id: c.categoryName,
                value: c.count,
              }))}
              keys={["value"]}
              indexBy="id"
              layout="horizontal"
              margin={{ top: 10, right: 30, bottom: 30, left: 110 }}
              colors={[
                "#00BCFF",
                "#0077b7",
                "#0c2c54",
                "#4eb3d3",
                "#6b7474",
                "#2ea3e3",
                "#164aa2",
                "#7bc8e0",
                "#b0d6e8",
                "#d4eaf5",
              ]}
              colorBy="indexValue"
              borderRadius={2}
              axisLeft={{ tickSize: 0 }}
              axisBottom={{ tickSize: 3 }}
              enableLabel={true}
              labelTextColor="#ffffff"
              animate={false}
            />
          </div>
        ),
        legendData: categoryChartData.reduce((acc, c) => {
          acc[c.categoryName] = c.count;
          return acc;
        }, {}),
      },
      {
        title: "Active vs Inactive",
        chart: (
          <DonutChartGeneric
            counts={activeChartData}
            onSliceClick={() => {}}
          />
        ),
        legendData: activeChartData,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusChartData, categoryChartData, activeChartData]
  );

  // Chat handlers
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen((open) => {
      const next = !open;
      if (next && messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Hi! Ask me anything about the project assets.",
          },
        ]);
      }
      return next;
    });
  };

  const handleSendMessage = async () => {
    const text = userMessage.trim();
    if (!text || isSendingMessage) return;
    setIsSendingMessage(true);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setUserMessage("");
    try {
      const res = await fetch(`${backendUrl}/ai/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          projectId,
          service: "assets",
          question: text,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Status ${res.status}`);
      }
      const { answer } = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: answer || "No answer returned." },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
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

  if (loading && !assetsData.results.length)
    return <BayerLoadingOverlay message="Loading assets..." />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <BayerBim360MainLayout projectId={projectId} accountId={accountId}>
      <h1 className="text-2xl font-bold text-right mb-1">Assets Report</h1>
      <hr className="my-4 border-gray-300" />

      {/* Filters + buttons row */}
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filters.filterCategoryId}
            onChange={(e) =>
              handleFilterChange("filterCategoryId", e.target.value)
            }
            className="border rounded px-2 py-2 text-sm bg-white"
          >
            <option value="">All Categories</option>
            {(summary?.byCategory || []).map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
          <select
            value={filters.filterStatusId}
            onChange={(e) =>
              handleFilterChange("filterStatusId", e.target.value)
            }
            className="border rounded px-2 py-2 text-sm bg-white"
          >
            <option value="">All Statuses</option>
            {(summary?.byStatus || []).map((s) => (
              <option key={s.statusId} value={s.statusId}>
                {s.statusName}
              </option>
            ))}
          </select>
          <select
            value={filters.filterIsActive}
            onChange={(e) =>
              handleFilterChange("filterIsActive", e.target.value)
            }
            className="border rounded px-2 py-2 text-sm bg-white"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {!isChatOpen && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          )}
        </div>
        <button
          onClick={toggleChat}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isChatOpen ? "Show Assets Table" : "Ask AI Assistant"}
        </button>
      </div>

      <div className="flex max-h-[825px] mb-8">
        {/* Charts carousel */}
        <section className="w-1/4 bg-gray-50 p-2 mr-4 rounded-lg shadow overflow-y-auto">
          {summaryLoading ? (
            <div className="flex items-center justify-center h-32">
              <span className="text-sm text-gray-500">Loading charts...</span>
            </div>
          ) : summary ? (
            <Slider {...reportsSliderSettings()}>
              {dataContainers.map((c) => (
                <div key={c.title} className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                  {c.chart}
                  <div className="text-xs mt-2 overflow-y-auto max-h-32">
                    {Object.entries(c.legendData).map(([k, v]) => (
                      <p key={k}>{`${k}: ${v}`}</p>
                    ))}
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-sm text-gray-500 p-4">
              No summary data available
            </p>
          )}
        </section>

        {/* Table or Chat */}
        <section className="w-3/4 bg-white p-4 rounded-lg shadow overflow-y-auto">
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
                      style={{ maxWidth: "80%" }}
                    >
                      <strong className="block mb-1">
                        {msg.role === "user" ? "You" : "Assistant"}
                      </strong>
                      <div className="whitespace-pre-wrap">
                        {msg.role === "assistant"
                          ? renderAssistantContent(msg.content)
                          : msg.content}
                      </div>
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
            <AssetsTable assets={assetsData.results} loading={loading} />
          )}
        </section>
      </div>

    </BayerBim360MainLayout>
  );
};

export default React.memo(Bim360ProjectAssetsPage);
