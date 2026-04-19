import { NavLink, Link } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/app" className="brand">
          Doczen AI
        </Link>
        <nav>
          <NavLink to="/app" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Dashboard
          </NavLink>
          <NavLink to="/app/patients" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Patients
          </NavLink>
          <NavLink to="/app/encounters/new" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            New Encounter
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Vertical AI Medical Admin Assistant</h1>
            <p>Patient → Encounter → AI Draft → Human Review → Final PDF</p>
          </div>
          <div className="status-pill">Clinic-scoped · Human review required</div>
        </header>
        {children}
      </main>
    </div>
  );
}
