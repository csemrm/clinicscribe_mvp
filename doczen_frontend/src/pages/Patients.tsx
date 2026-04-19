import { Link } from 'react-router-dom';

const patients = [
  { id: '1', name: 'Ava Johnson', dob: '1984-02-14', clinic: 'North Clinic' },
  { id: '2', name: 'Noah Patel', dob: '1978-11-30', clinic: 'North Clinic' },
  { id: '3', name: 'Mia Chen', dob: '1991-07-08', clinic: 'North Clinic' },
];

export default function Patients() {
  return (
    <div className="stack">
      <div className="card">
        <h2>Patients</h2>
        <p className="muted">Clinic-scoped patient list with reusable patient records.</p>
      </div>
      <div className="card">
        <div className="table">
          {patients.map((patient) => (
            <Link key={patient.id} to={`/app/patients/${patient.id}`} className="table-row">
              <span>{patient.name}</span>
              <span>{patient.dob}</span>
              <span>{patient.clinic}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
