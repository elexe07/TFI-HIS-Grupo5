import { useEffect, useState } from 'react';
import { http } from '../api/http';

interface Salud {
  status: 'ok' | 'degraded';
  db: 'ok' | 'error';
}

export function EstadoApi() {
  const [salud, setSalud] = useState<Salud | 'error' | null>(null);

  useEffect(() => {
    http
      .get<Salud>('/api/health')
      .then(setSalud)
      .catch(() => setSalud('error'));
  }, []);

  if (salud === null) return <span className="badge">API: ...</span>;
  if (salud === 'error') return <span className="badge badge-error">API: sin conexión</span>;
  return (
    <span className={`badge ${salud.status === 'ok' ? 'badge-ok' : 'badge-warn'}`}>
      API: {salud.status} · DB: {salud.db}
    </span>
  );
}
