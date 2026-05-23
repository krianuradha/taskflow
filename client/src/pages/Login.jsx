import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api.js";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h1 className="page-header">Login</h1>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input name="email" value={form.email} onChange={handleChange} id="email" type="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input name="password" value={form.password} onChange={handleChange} id="password" type="password" />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
      <div className="auth-footer">
        Don’t have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

export default Login;
