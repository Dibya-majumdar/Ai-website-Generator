import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

import type { ProjectFile } from "@/api/projectFilesApi";

function monacoLanguage(file: ProjectFile) {
  const lang = (file.language ?? "").toLowerCase();
  if (lang.includes("html")) return "html";
  if (lang.includes("css")) return "css";
  if (lang.includes("javascript") || lang === "js") return "javascript";
  if (file.path.endsWith(".html")) return "html";
  if (file.path.endsWith(".css")) return "css";
  if (file.path.endsWith(".js")) return "javascript";
  return "plaintext";
}

type Props = {
  file: ProjectFile | null;
  onChange: (path: string, content: string) => void;
};

export default function CodeEditor({ file, onChange }: Props) {
  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-mono text-sm text-muted-foreground">No file selected</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Generated files will appear here once the AI responds.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="rounded-md bg-elevated px-2 py-1 font-mono text-xs">{file.path}</span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase">
          {file.language}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          key={file.path}
          height="100%"
          theme="vs-dark"
          language={monacoLanguage(file)}
          value={file.content}
          onChange={(value) => onChange(file.path, value ?? "")}
          loading={<Loader2 className="size-5 animate-spin text-primary" />}
          options={{
            fontSize: 13,
            fontFamily: "JetBrains Mono, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 12 },
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
