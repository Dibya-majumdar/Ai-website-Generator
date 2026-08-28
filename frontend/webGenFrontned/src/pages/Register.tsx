import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "@/api/authApi";
import { getApiErrorMessage } from "@/api/apiClient";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        username,
        emailId,
        password,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Registration failed:", error);
      setError(getApiErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md">
        <div className="panel p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>

            <p className="mt-2 text-muted-foreground">
              Create your AiWebGen account
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="emailId"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="emailId"
                type="email"
                value={emailId}
                onChange={(event) => setEmailId(event.target.value)}
                placeholder="Enter email"
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create password"
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;