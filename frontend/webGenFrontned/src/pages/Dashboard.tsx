import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createProject,
  getUserProjects,
  type Project,
} from "@/api/projectApi";

import { getApiErrorMessage } from "@/api/apiClient";

import CreateProjectModal from "@/components/CreateProjectModal";
import ProjectCard from "@/components/ProjectCard";
import Sidebar from "@/components/Sidebar";

import { useAuth } from "@/context/AuthContext";

function Dashboard() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [creatingProject, setCreatingProject] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD USER PROJECTS
  // ==========================================

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserProjects(userId);

        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);

        setError(
          getApiErrorMessage(
            error,
            "Failed to load projects",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [userId]);

  // ==========================================
  // CREATE PROJECT
  // ==========================================

  const handleCreateProject = async (
    projectName: string,
  ) => {
    if (!userId) {
      setError("User is not logged in.");
      return;
    }

    try {
      setCreatingProject(true);
      setError("");

      console.log("Creating project...");
      console.log("Project name:", projectName);
      console.log("User ID:", userId);

      // Call Spring Boot backend
      const project = await createProject({
        projectName,
        userId,
      });

      console.log("Created project:", project);

      // Add project to dashboard immediately
      setProjects((currentProjects) => [
        ...currentProjects,
        project,
      ]);

      // Close modal
      setShowCreateModal(false);

      // Go to project page
      navigate(`/project/${project.projectId}`);
    } catch (error) {
      console.error("Failed to create project:", error);

      setError(
        getApiErrorMessage(
          error,
          "Failed to create project",
        ),
      );
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-6xl">

          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Your Projects
              </h1>

              <p className="mt-2 text-muted-foreground">
                Create and manage your AI generated websites.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-4" />
              New Project
            </button>
          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ==========================================
              LOADING
          ========================================== */}

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="size-7 animate-spin text-primary" />
            </div>
          )}

          {/* ==========================================
              NO PROJECTS
          ========================================== */}

          {!loading &&
            !error &&
            projects.length === 0 && (
              <div className="panel py-20 text-center">
                <h2 className="text-xl font-semibold">
                  No projects yet
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first AI website.
                </p>
              </div>
            )}

          {/* ==========================================
              PROJECTS
          ========================================== */}

          {!loading &&
            projects.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.projectId}
                    project={project}
                  />
                ))}
              </div>
            )}
        </div>
      </main>

      {/* ==========================================
          CREATE PROJECT MODAL
      ========================================== */}

      <CreateProjectModal
        open={showCreateModal}
        loading={creatingProject}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}

export default Dashboard;