import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api.js";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="panel">
      <h1 className="page-header">Projects</h1>
      {loading && <p>Loading workflow...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !projects.length && <p>No projects found yet.</p>}
      {projects.map((project) => (
        <div key={project._id} className="card">
          <h2>{project.name}</h2>
          <p>{project.description || "No description provided."}</p>
          <p>
            <strong>Owner:</strong> {project.owner?.fullname || project.owner?.username}
          </p>
          <Link to={`/projects/${project._id}`}>View workflow</Link>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
