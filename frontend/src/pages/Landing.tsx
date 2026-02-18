import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">ClinicScribe</h1>
        <div className="space-x-4">
          <Link
            to="/login"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          AI Medical Documentation & Form Assistant
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Reduce administrative workload by 30–50%. Generate structured SOAP
          notes, after-visit summaries, and administrative forms — with full
          clinician review required before export.
        </p>

        <div className="space-x-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700"
          >
            Start Free Trial
          </Link>
          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md text-lg hover:bg-blue-50"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-16 px-10">
        <h3 className="text-2xl font-bold text-center mb-10">
          The Problem in Healthcare
        </h3>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-gray-50 rounded-lg shadow">
            <h4 className="font-semibold text-lg mb-3">
              Administrative Overload
            </h4>
            <p>
              Doctors spend 30–40% of their time on paperwork instead of patient
              care.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg shadow">
            <h4 className="font-semibold text-lg mb-3">
              Fragmented Systems
            </h4>
            <p>
              EHRs, hospitals, and insurers do not communicate — requiring
              manual data transfer.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg shadow">
            <h4 className="font-semibold text-lg mb-3">
              Physician Burnout
            </h4>
            <p>
              Non-clinical work increases burnout and reduces quality of care.
            </p>
          </div>
        </div>
      </section>

      {/* What AI Does / Doesn't Do */}
      <section className="py-16 px-10 bg-gray-100">
        <h3 className="text-2xl font-bold text-center mb-10">
          What ClinicScribe Does
        </h3>

        <div className="max-w-3xl mx-auto space-y-4 text-lg">
          <div className="bg-green-50 p-4 rounded-md">
            ✅ Writes structured documentation (SOAP notes)
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            ✅ Fills administrative forms (referrals, prior auth, excuse notes)
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            ✅ Generates after-visit summaries
          </div>
          <div className="bg-red-50 p-4 rounded-md">
            ❌ Does NOT diagnose or make clinical decisions
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 px-10 text-center">
        <h3 className="text-2xl font-bold mb-6">Designed for Safety</h3>
        <p className="max-w-2xl mx-auto text-gray-600">
          All AI-generated content requires human review before final export.
          ClinicScribe is strictly an administrative documentation assistant —
          not a diagnostic tool.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} ClinicScribe — AI Administrative Assistant
      </footer>
    </div>
  );
}