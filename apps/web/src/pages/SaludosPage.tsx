import { type FormEvent, useEffect, useState } from 'react';
import { HttpError, http } from '../api/http';

interface Saludo {
  id: string;
  destinatario: string;
  mensaje: string;
  creadoEn: string;
}

/** Página de referencia: formulario → POST → refresca lista. Copiar el patrón, después borrar. */
export function SaludosPage() {
  const [saludos, setSaludos] = useState<Saludo[]>([]);
  const [destinatario, setDestinatario] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cargar = () =>
    http
      .get<Saludo[]>('/api/ejemplo/saludos')
      .then(setSaludos)
      .catch(() => setSaludos([]));

  useEffect(() => {
    void cargar();
  }, []);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    try {
      await http.post('/api/ejemplo/saludos', { destinatario });
      setDestinatario('');
      await cargar();
    } catch (e) {
      setError(e instanceof HttpError ? `${e.status}: ${e.message}` : 'Error inesperado');
    }
  }

  return (
    <section>
      <h2>Módulo de ejemplo</h2>
      <form onSubmit={(e) => void enviar(e)} className="fila">
        <input
          value={destinatario}
          onChange={(e) => setDestinatario(e.target.value)}
          placeholder="Destinatario"
          aria-label="Destinatario"
        />
        <button type="submit">Saludar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {saludos.map((s) => (
          <li key={s.id}>
            {s.mensaje} <small>({new Date(s.creadoEn).toLocaleString()})</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
