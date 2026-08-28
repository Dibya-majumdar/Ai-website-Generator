import { useState, type FormEvent } from "react";

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (projectName: string) => void;
};

function CreateProjectModal({
  open,
  loading,
  onClose,
  onCreate,
}: Props) {
  const [projectName, setProjectName] = useState("");

  if (!open) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const name = projectName.trim();

    if (!name) {
      return;
    }

    onCreate(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          Create New Project
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Enter a name for your AI website project.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="projectName"
            className="mb-2 block text-sm font-medium"
          >
            Project Name
          </label>

          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Portfolio Website"
            autoFocus
            disabled={loading}
            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-elevated disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !projectName.trim()}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;