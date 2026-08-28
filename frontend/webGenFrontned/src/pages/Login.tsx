import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "@/api/authApi";
import { getApiErrorMessage } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        emailId,
        password,
      });

      console.log("Login successful:", response);

      login({
        token: response.token,
        userId: response.userId,
        username: response.username,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      setError(getApiErrorMessage(error, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md">
        <div className="panel p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>

            <p className="mt-2 text-muted-foreground">
              Login to your AiWebGen account
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;