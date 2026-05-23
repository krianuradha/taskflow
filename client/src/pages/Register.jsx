import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api.js";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: "", username: "", email: "", password: "" });
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
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h1 className="page-header">Register</h1>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullname">Full Name</label>
          <input name="fullname" value={form.fullname} onChange={handleChange} id="fullname" />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input name="username" value={form.username} onChange={handleChange} id="username" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input name="email" value={form.email} onChange={handleChange} id="email" type="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input name="password" value={form.password} onChange={handleChange} id="password" type="password" />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
      </form>
      <div className="auth-footer">
        Already registered? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Register;
