import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, updateProject } from "../api.js";

const nextStatus = (status) => {
  if (status === "todo") return "in_progress";
  if (status === "in_progress") return "done";
  return "todo";
};

function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProject(projectId);
        setProject(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleStatusChange = async (taskIndex) => {
    if (!project) return;
    const updatedTasks = project.tasks.map((task, index) =>
      index === taskIndex ? { ...task, status: nextStatus(task.status) } : task,
    );

    try {
      const response = await updateProject(projectId, { tasks: updatedTasks });
      setProject(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="panel"><p>Loading workflow details...</p></div>;
  }

  if (error) {
    return <div className="panel"><p className="error-text">{error}</p></div>;
  }

  if (!project) {
    return <div className="panel"><p>Project not found.</p></div>;
  }

  return (
    <div className="panel">
      <h1 className="page-header">{project.name}</h1>
      <p>{project.description || "No description yet."}</p>
      <div className="card">
        <h2>Tasks</h2>
        {project.tasks?.length ? (
          project.tasks.map((task, index) => (
            <div key={task._id || index} className="task-row">
              <div>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
              </div>
              <div className="task-actions">
                <span className={`status status-${task.status}`}>{task.status.replace("_", " ")}</span>
                <button type="button" onClick={() => handleStatusChange(index)}>
                  Move to {nextStatus(task.status).replace("_", " ")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No tasks defined yet. Add tasks from the backend or extend the client later.</p>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
