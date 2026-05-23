import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="panel">
      <h1 className="page-header">Dashboard</h1>
      <div className="card">
        <h2>Welcome to TaskFlow</h2>
        <p>Use this dashboard to manage projects, tasks, and team collaboration with workflow boards and status tracking.</p>
      </div>
      <div className="card">
        <h3>Start your workflow</h3>
        <ul>
          <li>Register or log in to access your workspace.</li>
          <li>Open <Link to="/projects">Projects</Link> to view active workflows.</li>
          <li>Click a project to see tasks and move them through status stages.</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
