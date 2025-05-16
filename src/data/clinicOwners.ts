import { useClinicData } from '../hooks/useClinicData';

const ClinicOwnerDashboard = () => {
  const { owner, clinics, loading, error } = useClinicData();

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1>Welcome, {owner?.name}</h1>
      <ul>
        {clinics.map(clinic => (
          <li key={clinic.id}>{clinic.name}</li>
        ))}
      </ul>
    </div>
  );
};
