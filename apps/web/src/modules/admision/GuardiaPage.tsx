import { type FormEvent, useEffect, useState } from 'react';
import { HttpError } from '../../api/http';
import { admisionApi, type PacienteItem, type TriajeItem } from './api/admision.api';

const COLORES_TRIAJE: Record<string, { bg: string; text: string }> = {
  ROJO: { bg: '#e53e3e', text: '#fff' },
  NARANJA: { bg: '#dd6b20', text: '#fff' },
  AMARILLO: { bg: '#d69e2e', text: '#000' },
  VERDE: { bg: '#38a169', text: '#fff' },
  AZUL: { bg: '#3182ce', text: '#fff' },
};

export function GuardiaPage() {
  const [cola, setCola] = useState<TriajeItem[]>([]);
  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);

  const [pacienteId, setPacienteId] = useState('');
  const [nivel, setNivel] = useState('AMARILLO');
  const [motivo, setMotivo] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      const [cList, pList] = await Promise.all([
        admisionApi.obtenerColaGuardia(),
        admisionApi.buscarPacientes(),
      ]);
      setCola(cList);
      setPacientes(pList);
      if (pList[0]) setPacienteId(pList[0].id);
    } catch (e) {
      setError(
        e instanceof HttpError ? `${e.status}: ${e.message}` : 'Error al cargar datos de guardia',
      );
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, []);

  async function handleRegistrarTriaje(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    try {
      await admisionApi.registrarTriaje({
        pacienteId,
        nivel,
        motivo,
      });

      setMensajeExito(`Triaje nivel ${nivel} registrado en la cola.`);
      setMotivo('');
      const cList = await admisionApi.obtenerColaGuardia();
      setCola(cList);
    } catch (err) {
      setError(
        err instanceof HttpError ? `${err.status}: ${err.message}` : 'Error al registrar triaje',
      );
    }
  }

  return (
    <section>
      <h2>Módulo 2: Admisión — Guardia y Triaje</h2>

      {error && <p className="error">{error}</p>}
      {mensajeExito && <p style={{ color: '#2b6cb0' }}>{mensajeExito}</p>}

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginTop: '16px' }}
      >
        {/* Formulario de Triaje */}
        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #d9e2ec',
          }}
        >
          <h3>Clasificar Paciente (Triaje)</h3>
          <form
            onSubmit={(e) => void handleRegistrarTriaje(e)}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <label style={{ fontSize: '0.85rem' }}>
              Paciente que ingresa:
              <select
                required
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.apellido}, {p.nombre} ({p.tipoDocumento} {p.numeroDocumento})
                  </option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: '0.85rem' }}>
              Nivel de gravedad:
              <select
                required
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  fontWeight: 'bold',
                  backgroundColor: COLORES_TRIAJE[nivel]?.bg,
                  color: COLORES_TRIAJE[nivel]?.text,
                }}
              >
                <option value="ROJO" style={{ background: '#e53e3e', color: '#fff' }}>
                  ROJO — Reanimación / Emergencia
                </option>
                <option value="NARANJA" style={{ background: '#dd6b20', color: '#fff' }}>
                  NARANJA — Muy urgente
                </option>
                <option value="AMARILLO" style={{ background: '#d69e2e', color: '#000' }}>
                  AMARILLO — Urgente
                </option>
                <option value="VERDE" style={{ background: '#38a169', color: '#fff' }}>
                  VERDE — Menos urgente
                </option>
                <option value="AZUL" style={{ background: '#3182ce', color: '#fff' }}>
                  AZUL — No urgente
                </option>
              </select>
            </label>

            <label style={{ fontSize: '0.85rem' }}>
              Motivo / Sintomatología:
              <textarea
                required
                rows={3}
                placeholder="Descripción del estado del paciente al ingresar..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                style={{ width: '100%', marginTop: '4px', font: 'inherit' }}
              />
            </label>

            <button type="submit" style={{ marginTop: '8px' }}>
              Ingresar a Cola de Guardia
            </button>
          </form>
        </div>

        {/* Cola de Guardia Ordenada */}
        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #d9e2ec',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Cola de Guardia (Orden de Prioridad)</h3>
            <button type="button" onClick={() => void cargarDatos()}>
              Actualizar
            </button>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
              marginTop: '8px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '6px' }}>Prioridad</th>
                <th style={{ padding: '6px' }}>Nivel</th>
                <th style={{ padding: '6px' }}>Paciente</th>
                <th style={{ padding: '6px' }}>Llegada</th>
                <th style={{ padding: '6px' }}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {cola.map((t, index) => {
                const pac = pacientes.find((p) => p.id === t.pacienteId);
                const estiloColor = COLORES_TRIAJE[t.nivel] ?? { bg: '#cbd5e0', text: '#000' };
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>#{index + 1}</td>
                    <td style={{ padding: '6px' }}>
                      <span
                        style={{
                          backgroundColor: estiloColor.bg,
                          color: estiloColor.text,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                        }}
                      >
                        {t.nivel}
                      </span>
                    </td>
                    <td style={{ padding: '6px' }}>
                      {pac ? `${pac.apellido}, ${pac.nombre}` : t.pacienteId.slice(0, 8)}
                    </td>
                    <td style={{ padding: '6px' }}>{new Date(t.llegadaEn).toLocaleTimeString()}</td>
                    <td style={{ padding: '6px', maxWidth: '200px' }}>{t.motivo}</td>
                  </tr>
                );
              })}
              {cola.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '16px', color: '#718096' }}
                  >
                    No hay pacientes en espera en la guardia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
