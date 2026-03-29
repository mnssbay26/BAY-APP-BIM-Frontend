import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import BayerBim360MainLayout from "@/components/platform_general_components/bim360_components/bim360.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchBim360ProjectIssues,
  fetchBim360ProjectData,
} from "../../pages/services/bim360.services";

import IssuesTable from "../../components/issues_components/issues.table.jsx";
import DonutChartGeneric from "../../components/issues_components/issues.generc.chart.jsx";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const sampleQuestions = [
  "How many open issues exist in the project?",
  "List all issues that are overdue.",
  "What is the percentage of open vs. closed issues?",
  "Which issues have a description containing 'puertas'?",
  "Which users currently have the most open issues?",
  "What is the average time (in days) between createdAt and closedAt for all closed issues?",
  "Group the issues by priority and give me the count per priority level.",
  "Which disciplines have no open issues?",
  "List issues with dueDate within the next 7 days.",
  "Which issues have never been updated since creation?",
  "Show me the top 3 most recently created issues.",
  "How many issues were opened in the last month?",
  "Which issues are assigned to 'Unknown_User' and still open?",
  "What is the ratio of issues per issueTypeName (e.g., Design vs. Coordination)?",
];

/* ---------------- UI Helpers for AI messages ---------------- */

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
  // Array -> lista o tabla
  if (Array.isArray(content)) {
    if (content.length === 0) return <em>Empty list</em>;

    // Lista simple (strings/numbers)
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

    // Tabla (array de objetos)
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

  // String -> intenta parsear JSON para embellecer
  if (typeof content === "string") {
    const s = content.trim();

    // Si parece JSON, parsea y reusa renderer
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

    // Dejar como texto plano
    return <span>{content}</span>;
  }

  // Objeto suelto (no debería llegar, pero lo soportamos)
  if (typeof content === "object" && content !== null) {
    return (
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  }

  // Fallback
  return <span>{String(content)}</span>;
}

/* ---------------- Page ---------------- */

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

  const [activeSlide, setActiveSlide] = useState(0);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

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

  /* ---------- Chat Handlers ---------- */
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
            content: "Hi! Ask me anything about the project issues.",
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
      const res = await fetch(`${backendUrl}/ai/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          projectId,
          service: "issues",
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
    <BayerBim360MainLayout projectId={projectId} accountId={accountId}>
      <h1 className="text-2xl font-bold text-right mb-1">
        Project Issues Report
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
          {isChatOpen ? "Show Issues Table" : "Ask AI Assistant"}
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
              <DonutChartGeneric
                counts={dataContainers[activeSlide].data}
                onSliceClick={(v) => handleFilterClick(dataContainers[activeSlide].filterKey, v)}
              />
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
                      style={{ maxWidth: "80%" }}
                    >
                      <strong className="block mb-1">
                        {msg.role === "user" ? "You" : "Assistant"}
                      </strong>

                      {/* Renderer evita errores cuando answer es array/obj */}
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
            <IssuesTable issues={displayedIssues} customColumns={customTitles} />
          )}
        </section>
      </div>
    </BayerBim360MainLayout>
  );
};

export default React.memo(Bim360ProjectIssuesPage);