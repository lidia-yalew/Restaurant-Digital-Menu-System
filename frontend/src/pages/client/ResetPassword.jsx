import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../API/authapi";
import WetPaintButton from "../../componests/UI/Button"

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);       // ✅ was "success", renamed to "done"
  const [loading, setLoading] = useState(false); // ✅ was missing

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (passwords.password !== passwords.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (passwords.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, passwords.password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden lg:mt-16 mt-12">
      <div className="w-[340px] md:w-[360px] bg-card/40 backdrop-blur-md border border-primary rounded-4xl p-8 shadow-2xl text-text">
        <h2 className="text-center text-4xl font-serif italic mb-3 text-primary">
          {done ? "Password Reset!" : "New Password"}
        </h2>
        <div className="h-1 w-40 bg-primary mx-auto rounded mb-6" />

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-text/70 text-sm mb-2">Password changed successfully!</p>
            <p className="text-text/40 text-xs">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!token && (
              <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded text-text text-sm text-center">
                Invalid or expired reset link.
              </div>
            )}

            {error && (
              <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded text-text text-sm text-center">
                {error}
              </div>
            )}

            <div className="mb-4">
              <input
                type="password"
                placeholder="New password"
                value={passwords.password}
                onChange={(e) => { setPasswords(p => ({ ...p, password: e.target.value })); setError(""); }}
                required
                disabled={loading || !token}
                className="w-full px-4 py-2 rounded-full bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-black/50 text-text"
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => { setPasswords(p => ({ ...p, confirm: e.target.value })); setError(""); }}
                required
                disabled={loading || !token}
                className="w-full px-4 py-2 rounded-full bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-black/50 text-text"
              />
            </div>

            <WetPaintButton
              type="submit"
              disabled={loading || !token}
              className="mx-auto text-xl md:text-base px-2 md:px-8 md:py-2 w-full"
            >
              {loading ? "Saving..." : "Reset Password"}
            </WetPaintButton>

            <div className="flex justify-center mt-6">
              <Link to="/login" className="text-primary underline text-sm hover:opacity-80">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}