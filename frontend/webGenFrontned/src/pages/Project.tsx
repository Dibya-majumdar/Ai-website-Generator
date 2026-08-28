import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { askAi } from "@/api/aiApi";
import {
  getProjectFiles,
  type ProjectFile,
} from "@/api/projectFilesApi";

import LivePreview from "@/components/LivePreview";
import CodeEditor from "@/components/CodeEditor";
import { useAuth } from "@/context/AuthContext";

type ChatMessage = {
  id: number;
  role: "user" | "ai";
  content: string;
};

function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const { userId } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // ============================================================
  // LOAD PROJECT FILES
  // ============================================================

  useEffect(() => {
    if (!projectId) return;

    const loadFiles = async () => {
      try {
        const projectFiles = await getProjectFiles(projectId);

        setFiles(projectFiles);

        const firstFile = projectFiles[0];

        if (firstFile) {
          setActivePath(firstFile.path);
        }
      } catch (err) {
        console.error("Failed to load project files:", err);
        setError("Failed to load project files.");
      }
    };

    loadFiles();
  }, [projectId]);

  // ============================================================
  // GENERATE WEBSITE
  // ============================================================

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    if (!userId) {
      setError("User is not logged in.");
      return;
    }

    const userPrompt = prompt.trim();

    // Add user message
    setChatMessages((messages) => [
      ...messages,
      {
        id: Date.now(),
        role: "user",
        content: userPrompt,
      },
    ]);

    setPrompt("");
    setLoading(true);
    setError("");

    try {
      console.log("Calling AI API...");
      console.log("Project ID:", projectId);
      console.log("User ID:", userId);
      console.log("Prompt:", userPrompt);

      // ========================================================
      // CALL BACKEND AI API
      // ========================================================

      const response = await askAi({
        prompt: userPrompt,
        userId,
        projectId,
      });

      console.log("AI response:", response);

      // ========================================================
      // ADD AI RESPONSE TO CHAT
      // ========================================================

      const aiResponse =
        (response as { message?: string })?.message ||
        "Website generated successfully.";

      setChatMessages((messages) => [
        ...messages,
        {
          id: Date.now() + 1,
          role: "ai",
          content: aiResponse,
        },
      ]);

      // ========================================================
      // LOAD UPDATED FILES
      // ========================================================

      const projectFiles = await getProjectFiles(projectId);

      console.log("Project files:", projectFiles);

      setFiles(projectFiles);

      const firstFile = projectFiles[0];

      if (firstFile) {
        setActivePath(firstFile.path);
      }

      // Refresh preview
      setRefreshKey((value) => value + 1);

    } catch (err) {
      console.error("Website generation failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to generate website.";

      setError(message);

      setChatMessages((messages) => [
        ...messages,
        {
          id: Date.now() + 2,
          role: "ai",
          content:
            "Sorry, I couldn't generate the website. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ACTIVE FILE
  // ============================================================

  const activeFile =
    files.find((file) => file.path === activePath) ?? null;

  // ============================================================
  // CHANGE CODE
  // ============================================================

  const handleFileChange = (
    path: string,
    content: string,
  ) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.path === path
          ? {
              ...file,
              content,
            }
          : file,
      ),
    );
  };

  // ============================================================
  // QUICK PROMPT
  // ============================================================

  const setQuickPrompt = (value: string) => {
    setPrompt(value);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* ========================================================
          PROJECT HEADER
          ======================================================== */}

      <header className="border-b border-white/10 bg-[#070b18]">

        <div className="flex min-h-[68px] items-center justify-between px-4 sm:px-6">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">

            <Link
              to="/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              ←
            </Link>

            <div className="min-w-0">

              <h1 className="truncate text-lg font-semibold">
                AI Website Builder
              </h1>

              <p className="truncate text-xs text-slate-500">
                Build your website by chatting with AI
              </p>

            </div>

          </div>


          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-2">

            <button
              type="button"
              onClick={() =>
                setRefreshKey((value) => value + 1)
              }
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              ↗ Share
            </button>

          </div>

        </div>

      </header>


      {/* ========================================================
          PROJECT WORKSPACE

          LEFT  = CHAT
          RIGHT = CODE + PREVIEW
          ======================================================== */}

      <main className="mx-auto w-full max-w-[1800px]">

        <div
          className="
            grid
            min-h-[calc(100vh-69px)]
            grid-cols-1
            lg:grid-cols-[360px_minmax(0,1fr)]
          "
        >


          {/* ====================================================
              LEFT CHAT PANEL
              ==================================================== */}

          <aside
            className="
              flex
              min-h-[600px]
              flex-col
              border-b
              border-white/10
              bg-[#080d1c]
              lg:min-h-[calc(100vh-69px)]
              lg:border-b-0
              lg:border-r
            "
          >

            {/* Chat Header */}

            <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-white/10 px-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-lg">
                  ✦
                </div>

                <div>

                  <h2 className="text-sm font-semibold">
                    AI Assistant
                  </h2>

                  <div className="flex items-center gap-1.5">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[11px] text-emerald-400">
                      Online
                    </span>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={() => setChatMessages([])}
                className="text-xs text-slate-500 transition hover:text-white"
              >
                Clear
              </button>

            </div>


            {/* ==================================================
                CHAT MESSAGES
                ================================================== */}

            <div className="flex-1 overflow-y-auto px-4 py-5">

              {chatMessages.length === 0 ? (

                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-400">
                    ✦
                  </div>

                  <h2 className="text-lg font-semibold">
                    What should we build?
                  </h2>

                  <p className="mt-2 max-w-[270px] text-xs leading-5 text-slate-500">
                    Describe any website or web app and I'll generate the code for you.
                  </p>


                  {/* QUICK PROMPTS */}

                  <div className="mt-6 w-full space-y-2">

                    <button
                      type="button"
                      onClick={() =>
                        setQuickPrompt(
                          "Create a modern calculator website"
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs text-slate-400 transition hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-white"
                    >
                      ✦ Create a modern calculator
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setQuickPrompt(
                          "Create a modern weather app"
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs text-slate-400 transition hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-white"
                    >
                      ✦ Create a weather app
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setQuickPrompt(
                          "Create a modern portfolio website"
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs text-slate-400 transition hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-white"
                    >
                      ✦ Create a portfolio
                    </button>

                  </div>

                </div>

              ) : (

                <div className="space-y-5">

                  {chatMessages.map((message) => (

                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={
                          message.role === "user"
                            ? "max-w-[90%] rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm leading-5"
                            : "max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-5 text-slate-300"
                        }
                      >

                        {message.role === "ai" && (
                          <div className="mb-2 text-[11px] font-medium text-violet-300">
                            ✦ AI Assistant
                          </div>
                        )}

                        {message.content}

                      </div>

                    </div>

                  ))}


                  {/* LOADING */}

                  {loading && (

                    <div className="flex justify-start">

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">

                        <div className="flex gap-1">

                          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />

                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                            style={{
                              animationDelay: "100ms",
                            }}
                          />

                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                            style={{
                              animationDelay: "200ms",
                            }}
                          />

                        </div>

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>


            {/* ERROR */}

            {error && (

              <div className="mx-4 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>

            )}


            {/* ==================================================
                CHAT INPUT
                ALWAYS AT BOTTOM
                ================================================== */}

            <div className="shrink-0 border-t border-white/10 bg-[#080d1c] p-4">

              <form onSubmit={handleGenerate}>

                <div className="relative">

                  <textarea
                    value={prompt}
                    onChange={(e) =>
                      setPrompt(e.target.value)
                    }
                    disabled={loading}
                    rows={4}
                    placeholder="Ask AI to build anything..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-white/10
                      bg-[#0c1224]
                      px-4
                      py-3
                      pr-12
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-slate-600
                      focus:border-violet-500/50
                      focus:ring-1
                      focus:ring-violet-500/20
                      disabled:opacity-50
                    "
                    onKeyDown={(e) => {

                      if (
                        e.key === "Enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();

                        if (
                          !loading &&
                          prompt.trim()
                        ) {
                          handleGenerate(
                            e as unknown as FormEvent
                          );
                        }
                      }

                    }}
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !prompt.trim()
                    }
                    className="
                      absolute
                      bottom-3
                      right-3
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-gradient-to-r
                      from-violet-600
                      to-blue-600
                      text-sm
                      transition
                      hover:scale-105
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    {loading ? "..." : "↑"}
                  </button>

                </div>

                <p className="mt-2 text-center text-[10px] text-slate-600">
                  Enter to generate • Shift + Enter for new line
                </p>

              </form>

            </div>

          </aside>


          {/* ====================================================
              RIGHT WORKSPACE

              THIS IS THE ONLY SCROLLABLE AREA
              ==================================================== */}

          <section
            className="
              min-w-0
              bg-[#050816]
              lg:h-[calc(100vh-69px)]
              lg:overflow-y-auto
            "
          >

            <div className="p-4 sm:p-5 lg:p-6">


              {/* =================================================
                  CODE SECTION
                  ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080d1c]">

                {/* Code Header */}

                <div className="flex min-h-[58px] items-center justify-between border-b border-white/10">

                  <div className="flex min-w-0 flex-1 overflow-x-auto">

                    {files.length === 0 ? (

                      <div className="px-5 py-4 text-xs text-slate-600">
                        No files generated yet
                      </div>

                    ) : (

                      files.map((file) => (

                        <button
                          key={file.path}
                          type="button"
                          onClick={() =>
                            setActivePath(file.path)
                          }
                          className={`
                            flex
                            shrink-0
                            items-center
                            gap-2
                            border-r
                            border-white/10
                            px-4
                            py-4
                            text-xs
                            transition

                            ${
                              activePath === file.path
                                ? "border-t-2 border-t-violet-500 bg-[#0c1224] text-white"
                                : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
                            }
                          `}
                        >

                          <span className="text-violet-400">

                            {file.language === "html"
                              ? "▣"
                              : file.language === "css"
                                ? "◇"
                                : "JS"}

                          </span>

                          {file.path}

                        </button>

                      ))

                    )}

                  </div>

                  <div className="hidden shrink-0 items-center gap-3 px-4 sm:flex">

                    <button
                      type="button"
                      className="text-xs text-slate-500 transition hover:text-white"
                    >
                      ⧉
                    </button>

                    <button
                      type="button"
                      className="text-xs text-slate-500 transition hover:text-white"
                    >
                      ⛶
                    </button>

                  </div>

                </div>


                {/* Code Editor */}

                <div className="h-[600px]">

                  {files.length === 0 ? (

                    <div className="flex h-full items-center justify-center">

                      <div className="text-center">

                        <div className="mb-4 text-4xl text-slate-700">
                          {"</>"}
                        </div>

                        <p className="text-sm text-slate-500">
                          Generated code will appear here
                        </p>

                        <p className="mt-2 text-xs text-slate-700">
                          Ask the AI to build a website
                        </p>

                      </div>

                    </div>

                  ) : (

                    <CodeEditor
                      file={activeFile}
                      onChange={handleFileChange}
                    />

                  )}

                </div>

              </div>


              {/* =================================================
                  LIVE PREVIEW
                  ================================================= */}

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#080d1c]">

                {/* Preview Header */}

                <div className="flex min-h-[58px] items-center justify-between border-b border-white/10 px-5">

                  <div className="flex items-center gap-3">

                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                    <span className="text-sm font-semibold">
                      Live Preview
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setRefreshKey(
                        (value) => value + 1
                      )
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    ↻ Refresh
                  </button>

                </div>


                {/* Preview Container */}

                <div className="min-h-[750px] bg-[#111827] p-3 sm:p-4">

                  <LivePreview
                    files={files}
                    refreshKey={refreshKey}
                    onRefresh={() =>
                      setRefreshKey(
                        (value) => value + 1
                      )
                    }
                  />

                </div>

              </div>


              {/* =================================================
                  PROJECT INFORMATION
                  ================================================= */}

              <div className="mt-5 rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3">

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">

                  <span>
                    Project ID:
                    <span className="ml-2 text-slate-500">
                      {projectId}
                    </span>
                  </span>

                  <span>
                    Files:
                    <span className="ml-2 text-slate-500">
                      {files.length}
                    </span>
                  </span>

                  <span>
                    Status:
                    <span className="ml-2 text-emerald-500">
                      Ready
                    </span>
                  </span>

                </div>

              </div>


            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Project;