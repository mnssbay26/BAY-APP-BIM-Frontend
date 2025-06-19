import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BayerAccMainLayout from "@/components/platform_general_components/acc_components/acc.main.layout.jsx";
import BayerLoadingOverlay from "@/components/general/general.pages.loading.jsx";

import {
  fetchAccProjectIssues,
  fetchAccProjectData,
} from "../../pages/services/acc.services.js";

import IssuesTable from "../../components/issues_components/issues.table.jsx";
import DonutChartGeneric from "../../components/issues_components/issues.generc.chart.jsx";

import { reportsSliderSettings } from "../utils/project.slider.settings.utils.js";

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
  "What is the ratio of issues per issueTypeName (e.g., Design vs. Coordination)?"
];

const AccProjectIssuesPage = () => {
  const { projectId, accountId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projectData, setProjectData] = useState(null);
  const [issues, setIssues] = useState([]);

  const [activeFilters, setActiveFilters] = useState({
    status: null,
    issueTypeName: null,
  });

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAccProjectIssues(projectId, accountId),
      fetchAccProjectData(projectId, accountId),
    ])
      .then(([issuesData, projectData]) => {
        if (projectData) setProjectData(projectData);
        if (issuesData?.issues) setIssues(issuesData.issues);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  const itemsCounts = (list, keyFn) =>
    list.reduce((acc, item) => {
      const k = keyFn(item);
      if (k) acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

  const { chartsData, customTitles } = useMemo(() => {
    if (!issues.length)
      return { chartsData: { status: {}, type: {}, custom: {} }, customTitles: [] };
    const status = itemsCounts(issues, (i) => i.status);
    const type = itemsCounts(issues, (i) => i.issueTypeName);
    const custom = {};
    issues.forEach((i) =>
      i.customAttributes?.forEach((a) => {
        custom[a.title] = custom[a.title] || {};
        const key = a.readableValue || "Not Specified";
        custom[a.title][key] = (custom[a.title][key] || 0) + 1;
      })
    );
    return { chartsData: { status, type, custom }, customTitles: Object.keys(custom) };
  }, [issues]);

  const displayedIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (activeFilters.status && issue.status !== activeFilters.status) return false;
      if (
        activeFilters.issueTypeName &&
        issue.issueTypeName !== activeFilters.issueTypeName
      )
        return false;
      return Object.entries(activeFilters).every(([key, val]) => {
        if (!val || key === "status" || key === "issueTypeName") return true;
        return issue.customAttributes?.some(
          (a) => a.title.toLowerCase() === key && (a.readableValue || "Not Specified") === val
        );
      });
    });
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
          { role: "assistant", content: "Hi! Ask me anything about the project issues." },
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

  if (loading)
    return <BayerLoadingOverlay message="Loading project details..." />;
  if (error) return <div className="text-red-600">{error}</div>;

  const dataContainers = [
    {
      title: "Issue Status Chart",
      data: chartsData.status,
      filterKey: "status",
    },
    {
      title: "Issue Type Chart",
      data: chartsData.type,
      filterKey: "issueTypeName",
    },
    ...Object.entries(chartsData.custom).map(([t, d]) => ({
      title: t,
      data: d,
      filterKey: t.toLowerCase(),
    })),
  ];

  return (
    <BayerAccMainLayout projectId={projectId} accountId={accountId}>
      <h1 className="text-2xl font-bold text-right mb-1">Project Issues Report</h1>
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
          {isChatOpen ? "Show Issues Table" : "Ask AI Assistant"}
        </button>
      </div>

      <div className="flex max-h-[775px] mb-8">
        {/* Charts Carousel */}
        <section className="w-1/4 bg-gray-50 p-2 mr-4 rounded-lg shadow">
          <Slider {...reportsSliderSettings()}>
            {dataContainers.map((c) => (
              <div key={c.title} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <DonutChartGeneric
                  counts={c.data}
                  onSliceClick={(v) => handleFilterClick(c.filterKey, v)}
                />
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
                      {msg.content}
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
    </BayerAccMainLayout>
  );
};

export default React.memo(AccProjectIssuesPage);