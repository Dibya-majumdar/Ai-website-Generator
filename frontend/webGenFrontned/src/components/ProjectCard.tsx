import { ArrowUpRight, FolderCode } from "lucide-react";
import { Link } from "react-router-dom";

import type { Project } from "@/api/projectApi";

export default function ProjectCard({
  project,
}: {
  project: Project;
}) {
  return (
    <Link
      to={`/project/${project.projectId}`}
      className="group panel flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FolderCode className="size-5" />
        </span>

        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>

      <div>
        <h3 className="truncate font-medium">
          {project.projectName}
        </h3>

        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
          {project.projectId}
        </p>
      </div>
    </Link>
  );
}