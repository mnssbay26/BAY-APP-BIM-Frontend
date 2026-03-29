import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

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

const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

const sampleQuestions = [
  "How many open RFIs exist in the project?",
  "List all RFIs that are still open.",
  "What is the percentage of answered vs closed vs open RFIs?",
  "Which RFIs have 'electrical' in their question field?",
  "Which RFIs are due before today?",
];

/* ---------- UI helpers for assistant messages ---------- */
const fmt = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* noop */
  }
};

function renderAssistantContent(content) {
  // Array
  if (Array.isArray(content)) {
    if (content.length === 0) return <em>Empty list</em>;

    // array simple
    if (typeof content[0] === "string" || typeof content[0] === "number") {
      return (
        <div>
          <div className="text-xs mb-2">
            <button
              onClick={() => copyText(content.join(", "))}
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

    // array de objetos -> tabla
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
          <div className="text-[10px] mt-1 text-gray-500">Rows: {content.length}</div>
        </div>
      );
    }
  }

  // String -> intenta JSON
  if (typeof content === "string") {
    const s = content.trim();
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(s);
        return renderAssistantContent(parsed);
      } catch {
        /* fallthrough */
      }
    }
    return <span>{content}</span>;
  }

  // objeto suelto
  if (typeof content === "object" && content !== null) {
    return (
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  }

  return <span>{String(content)}</span>;
}
/* ------------------------------------------------------- */

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

  const [activeSlide, setActiveSlide] = useState(0);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

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

  // chat handlers
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen((open) => {
      if (!open && messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Hi! Ask me anything about the project RFIs.",
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
      const res = await fetch(`${backendUrl}/ai/rfis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          projectId,
          service: "rfis",
          question: text,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { answer } = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: answer || "No answer." },
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
    <BayerAccMainLayout projectId={projectId} accountId={accountId}>
      <h1 className="text-2xl font-bold text-right mb-1">RFIs Report Page</h1>
      <h2 className="text-lg text-right font-semibold mb-4 text-gray-600">
        {projectData?.name}
      </h2>
      <hr className="my-4 border-gray-300" />

      <div className="mb-4 text-right space-x-2">
        {!isChatOpen && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Reset Filters
          </button>
        )}
        <button
          onClick={toggleChat}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isChatOpen ? "Show RFIs Table" : "Ask AI Assistant"}
        </button>
      </div>

      <div className="flex mb-8">
        {/* Charts Carousel */}
        <section className="w-1/4 bg-gray-50 p-2 mr-4 rounded-lg shadow overflow-hidden flex flex-col">
          <div className="flex flex-col flex-1">
            <div className="p-3">
              <h3 className="text-sm font-semibold mb-2">
                {dataContainers[activeSlide].title}
              </h3>
              {React.createElement(dataContainers[activeSlide].chart, {
                data: dataContainers[activeSlide].data,
                onSliceClick: dataContainers[activeSlide].onClickName,
              })}
              <div className="text-xs mt-2">
                {Object.entries(dataContainers[activeSlide].data).map(([k, v]) => (
                  <p key={k}>{`${k}: ${v}`}</p>
                ))}
              </div>
            </div>
            <div className="flex justify-center items-center gap-2 py-2 mt-auto">
              {dataContainers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeSlide ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
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
                      style={{ maxWidth: "80%", whiteSpace: "pre-wrap" }}
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
            <RFITable rfis={displayedRFIs} onViewDetails={() => {}} />
          )}
        </section>
      </div>
    </BayerAccMainLayout>
  );
};

export default React.memo(AccProjectRfisPage);
