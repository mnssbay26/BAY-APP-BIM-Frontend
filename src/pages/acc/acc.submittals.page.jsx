import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BayerAccMainLayout from "@/components/platform_general_components/acc_components/acc.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchAccProjectData,
  fetchAccProjectSubmittals,
} from "../../pages/services/acc.services.js";

import SubmittalsTable from "../../components/submittals_components/acc.submittals.table.jsx";
import SubmittalsStatusChart from "../../components/submittals_components/acc.submittals.status.chart.jsx";
import SubmittalsSpecChart from "../../components/submittals_components/acc.submittals.spec.chart.jsx";

import { reportsSliderSettings } from "../utils/project.slider.settings.utils.js";

const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

const sampleQuestions = [
  "How many submittals are in review?",
  "List all submittals waiting for submission.",
  "What percentage of submittals are closed?",
  "Which submittals have no spec assigned?",
  "Show me the top 5 most recent submittals.",
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
  // Arrays
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

  // Strings → intenta JSON
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

  // Objeto suelto
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

const AccProjectSubmittalsPage = () => {
  const [projectsData, setProjectsData] = useState(null);
  const [projectData, setProject] = useState({});
  const { projectId, accountId } = useParams();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [submittals, setSubmittals] = useState([]);
  const [submittalsTotals, setSubmittalsTotals] = useState({
    total: 0,
    waitingforsubmission: 0,
    inreview: 0,
    reviewed: 0,
    submitted: 0,
    closed: 0,
  });
  const [filteredSubmittals, setFilteredSubmittals] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [specCounts, setSpecCounts] = useState({});

  const [activeFilters, setActiveFilters] = useState({
    status: null,
    spec: null,
  });

  // chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

  // chat handlers
  useEffect(() => {
    if (conversationRef.current)
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAccProjectData(projectId, accountId),
      fetchAccProjectSubmittals(projectId, accountId),
    ])
      .then(([projectData, submittalsData]) => {
        if (projectData) {
          setProject(projectData);
        }

        if (submittalsData) {
          setSubmittals(submittalsData.submittals);
        }

        if (submittalsData && submittalsData.submittals) {
          setFilteredSubmittals(submittalsData.submittals);
          setSubmittalsTotals({
            total: submittalsData.submittals.length,
            waitingforsubmission: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Waiting for submission"
            ).length,
            inreview: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "In review"
            ).length,
            reviewed: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Reviewed"
            ).length,
            submitted: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Submitted"
            ).length,
            closed: submittalsData.submittals.filter(
              (submittal) => submittal.stateId === "Closed"
            ).length,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching submittals:", error);
        setError("Failed to load submittals. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, accountId]);

  //console.log("Submittals Data:", submittals);

  useEffect(() => {
    if (!submittals.length) {
      setStatusCounts({});
      setSpecCounts({});
      return;
    }

    const status = submittals.reduce((acc, sub) => {
      const key = sub.stateId || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    setStatusCounts(status);

    const specs = submittals.reduce((acc, sub) => {
      const title = sub.specDetails?.title || "Not Specified";
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {});
    setSpecCounts(specs);
  }, [submittals]);

  useEffect(() => {
    if (submittals.length === 0) {
      setFilteredSubmittals([]);
      return;
    }

    let updated = [...submittals];

    if (activeFilters.status) {
      updated = updated.filter((sub) => sub.stateId === activeFilters.status);
    }

    if (activeFilters.spec) {
      updated = updated.filter((sub) => {
        const specTitle = sub.specDetails?.title || "Unknown Spec";
        return specTitle === activeFilters.spec;
      });
    }

    setFilteredSubmittals(updated);
  }, [activeFilters, submittals]);

  const handleFilterClick = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: null,
      spec: null,
    });
  };

  const dataContainers = [
    {
      title: "Submittals Status Chart",
      content: statusCounts,
      chart: SubmittalsStatusChart,
      data: statusCounts,
      onClickName: (status) => handleFilterClick("status", status),
    },
    {
      title: "Submittals Spec Chart",
      content: specCounts,
      chart: SubmittalsSpecChart,
      data: specCounts,
      onClickName: (specTitle) => handleFilterClick("spec", specTitle),
    },
  ];

  const displayedSubmittals =
    filteredSubmittals.length > 0 ||
    Object.values(activeFilters).some((val) => val !== null)
      ? filteredSubmittals
      : submittals;

  if (loading) {
    return <BayerLoadingOverlay message="Loading project details..." />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const toggleChat = () => {
    setIsChatOpen((open) => {
      if (!open && messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Hi! Ask me anything about submittals.",
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
      const res = await fetch(`${backendUrl}/ai/submittals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          projectId,
          service: "submittals",
          question: text,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { answer } = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: answer || "No answer" },
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

  return (
    <BayerAccMainLayout projectId={projectId} accountId={accountId}>
      <h1 className="text-2xl font-bold text-right mb-1">
        Submittals Report Page
      </h1>
      <h2 className="text-lg font-semibold text-right mb-4 text-gray-600">
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
          {isChatOpen ? "Show Submittals Table" : "Ask AI Assistant"}
        </button>
      </div>

      <div className="flex max-h-[775px] mb-8">
        {/* Charts Carousel */}
        <section className="w-1/4 bg-gray-50 p-2 mr-4 rounded-lg shadow">
          <Slider {...reportsSliderSettings()}>
            {dataContainers.map((c) => (
              <div key={c.title} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <c.chart data={c.data} onSliceClick={c.onClickName} />
                <div className="text-xs mt-2 overflow-y-auto max-h-32">
                  {Object.entries(c.data).map(([k, v]) => (
                    <p key={k}>{`${k}: ${v}`}</p>
                  ))}
                </div>
              </div>
            ))}
          </Slider>
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
            <SubmittalsTable submittals={displayedSubmittals} />
          )}
        </section>
      </div>
    </BayerAccMainLayout>
  );
};

export default React.memo(AccProjectSubmittalsPage);