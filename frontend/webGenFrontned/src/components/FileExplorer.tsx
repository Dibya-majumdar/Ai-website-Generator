import { FileCode2, FileJson, FileType2, Folder } from "lucide-react";

import type { ProjectFile } from "@/api/projectFilesApi";
import { cn } from "@/lib/utils";

function iconFor(path: string) {
  if (path.endsWith(".css")) return FileType2;
  if (path.endsWith(".js") || path.endsWith(".ts")) return FileJson;
  return FileCode2;
}

type Props = {
  files: ProjectFile[];
  activePath: string | null;
  onSelect: (path: string) => void;
};

export default function FileExplorer({ files, activePath, onSelect }: Props) {
  const groups = files.reduce<Record<string, ProjectFile[]>>((acc, file) => {
    const parts = file.path.split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : ".";
    (acc[dir] ??= []).push(file);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Explorer</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            No files yet. Ask the AI to build something.
          </p>
        ) : (
          Object.entries(groups).map(([dir, dirFiles]) => (
            <div key={dir} className="mb-2">
              <p className="flex items-center gap-1.5 px-2 py-1 font-mono text-xs text-muted-foreground">
                <Folder className="size-3.5" />
                {dir === "." ? "root" : dir}
              </p>
              <ul>
                {dirFiles.map((file) => {
                  const Icon = iconFor(file.path);
                  const name = file.path.split("/").pop();
                  return (
                    <li key={file.path}>
                      <button
                        type="button"
                        onClick={() => onSelect(file.path)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left font-mono text-xs transition-colors",
                          activePath === file.path
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-elevated",
                        )}
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate">{name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
