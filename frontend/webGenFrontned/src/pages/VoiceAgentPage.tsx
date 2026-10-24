
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import VoiceAgent from "@/components/VoiceAgent";
import { useAuth } from "@/context/AuthContext";

export default function VoiceAgentPage() {
  const navigate = useNavigate();
  const { userId, isReady } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady) return;

    if (!userId) {
      setError("Please log in again.");
    } else {
      setError("");
    }

    setLoading(false);
  }, [userId, isReady]);

  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center gap-3 p-8">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          Loading voice agent...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        {error || !userId ? (
          <p role="alert" className="text-destructive">
            {error || "Please log in again."}
          </p>
        ) : (
          <VoiceAgent
            userId={userId}
            onBack={() => navigate("/dashboard")}
          />
        )}
      </main>
    </div>
  );
}








// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Mic, Plus, FolderOpen, LoaderCircle } from "lucide-react";

// import Sidebar from "@/components/Sidebar";
// import VoiceAgent from "@/components/VoiceAgent";

// import { useAuth } from "@/context/AuthContext";
// import {
//   createProject,
//   getUserProjects,
// } from "@/api/projectApi";
// import type { Project } from "@/api/projectApi";

// export default function VoiceAgentPage() {
//   const navigate = useNavigate();
//   const { userId, isReady } = useAuth();

//   const [projects, setProjects] = useState<Project[]>([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [projectName, setProjectName] = useState("Voice Project");

//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [error, setError] = useState("");

//   // Load projects belonging to the authenticated user.
//   useEffect(() => {
//     if (!isReady) return;

//     if (!userId) {
//       setError("Your user session is missing. Please log in again.");
//       setLoading(false);
//       return;
//     }

//     let cancelled = false;

//     async function loadProjects() {
//       setLoading(true);
//       setError("");

//       try {
//         const result = await getUserProjects(userId!);

// // Ensure the result is always an array.
// const projectList = result ?? [];

// if (!cancelled) {
//   setProjects(projectList);

//   // Automatically select the first existing project.
// const firstProject = projectList[0];

// if (firstProject) {
//   setSelectedProjectId(firstProject.projectId);
// }
// }
//       } catch (err) {
//         console.error("Failed to load projects:", err);

//         if (!cancelled) {
//           setError(
//             "Could not load your projects. Check your backend connection and try again."
//           );
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     void loadProjects();

//     return () => {
//       cancelled = true;
//     };
//   }, [userId, isReady]);

//   // Create a project using the existing project API.
//   async function handleCreateProject() {
//     if (!userId) {
//       setError("Please log in again before creating a project.");
//       return;
//     }

//     const name = projectName.trim();

//     if (!name) {
//       setError("Please enter a project name.");
//       return;
//     }

//     setCreating(true);
//     setError("");

//     try {
//       const project = await createProject({
//         projectName: name,
//         userId,
//       });

//       setProjects((previous) => [
//         project,
//         ...previous.filter(
//           (item) => item.projectId !== project.projectId
//         ),
//       ]);

//       setSelectedProjectId(project.projectId);
//     } catch (err) {
//       console.error("Failed to create project:", err);

//       setError(
//         "Could not create the project. Please check the backend response."
//       );
//     } finally {
//       setCreating(false);
//     }
//   }

//   const selectedProject = projects.find(
//     (project) => project.projectId === selectedProjectId
//   );

//   if (!isReady || loading) {
//     return (
//       <div className="flex min-h-screen bg-background text-foreground md:flex">
//         <Sidebar />

//         <main className="flex flex-1 items-center justify-center gap-3 p-8">
//           <LoaderCircle className="size-5 animate-spin text-primary" />
//           <span>Loading your projects...</span>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background text-foreground md:flex">
//       <Sidebar />

//       <main className="min-w-0 flex-1 p-5 md:p-8">
//         {selectedProject ? (
//           <VoiceAgent
//             userId={userId!}
//             projectId={selectedProject.projectId}
//             onBack={() => navigate("/dashboard")}
//           />
//         ) : (
//           <div className="mx-auto max-w-3xl">
//             <div className="mb-8 flex items-center gap-4">
//               <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
//                 <Mic className="size-7" />
//               </div>

//               <div>
//                 <h1 className="text-3xl font-bold tracking-tight">
//                   VoiceAgent
//                 </h1>

//                 <p className="mt-1 text-sm text-muted-foreground">
//                   Build websites by talking to your AI assistant.
//                 </p>
//               </div>
//             </div>

//             <section className="rounded-xl border border-border bg-card p-5 md:p-7">
//               <h2 className="text-lg font-semibold">
//                 Choose a project
//               </h2>

//               <p className="mt-2 text-sm text-muted-foreground">
//                 Select an existing project or create a new one
//                 to start building with your voice.
//               </p>

//               {error && (
//                 <div
//                   role="alert"
//                   className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
//                 >
//                   {error}
//                 </div>
//               )}

//               {projects.length > 0 && (
//                 <div className="mt-6">
//                   <label
//                     htmlFor="voice-project"
//                     className="mb-2 block text-sm font-medium"
//                   >
//                     Existing projects
//                   </label>

//                   <select
//                     id="voice-project"
//                     value={selectedProjectId}
//                     onChange={(event) =>
//                       setSelectedProjectId(event.target.value)
//                     }
//                     className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
//                   >
//                     {projects.map((project) => (
//                       <option
//                         key={project.projectId}
//                         value={project.projectId}
//                       >
//                         {project.projectName}
//                       </option>
//                     ))}
//                   </select>

//                   <button
//                     type="button"
//                     onClick={() => setError("")}
//                     className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
//                   >
//                     <Mic className="size-4" />
//                     Continue with selected project
//                   </button>
//                 </div>
//               )}

//               <div className="my-6 flex items-center gap-3">
//                 <div className="h-px flex-1 bg-border" />
//                 <span className="text-xs text-muted-foreground">
//                   OR CREATE NEW
//                 </span>
//                 <div className="h-px flex-1 bg-border" />
//               </div>

//               <label
//                 htmlFor="project-name"
//                 className="mb-2 block text-sm font-medium"
//               >
//                 New project name
//               </label>

//               <input
//                 id="project-name"
//                 value={projectName}
//                 onChange={(event) => setProjectName(event.target.value)}
//                 placeholder="e.g. Weather Application"
//                 maxLength={100}
//                 className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
//               />

//               <button
//                 type="button"
//                 onClick={handleCreateProject}
//                 disabled={creating || !projectName.trim() || !userId}
//                 className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {creating ? (
//                   <LoaderCircle className="size-4 animate-spin" />
//                 ) : (
//                   <Plus className="size-4" />
//                 )}

//                 {creating ? "Creating project..." : "Create project and continue"}
//               </button>
//             </section>

//             <div className="mt-5 flex items-start gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground">
//               <FolderOpen className="mt-0.5 size-5 shrink-0" />

//               <p>
//                 Your selected project ID and authenticated user ID
//                 will be passed to the voice agent. Your existing
//                 project-generation service will handle website creation.
//               </p>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
