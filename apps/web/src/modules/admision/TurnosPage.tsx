import { type FormEvent, useEffect, useState } from 'react';
import { HttpError } from '../../api/http';
import {
  admisionApi,
  type MedicoItem,
  type PacienteItem,
  type TurnoItem,
} from './api/admision.api';

export function TurnosPage() {
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);

  const [pacienteId, setPacienteId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [inicio, setInicio] = useState('');
  const [motivoConsulta, setMotivoConsulta] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      const [tList, pList, mList] = await Promise.all([
        admisionApi.listarTurnos(),
        admisionApi.buscarPacientes(),
        admisionApi.listarMedicos(),
      ]);
      setTurnos(tList);
      setPacientes(pList);
      setMedicos(mList);
      if (pList[0]) setPacienteId(pList[0].id);
      if (mList[0]) setMedicoId(mList[0].id);
    } catch (e) {
      setError(e instanceof HttpError ? `${e.status}: ${e.message}` : 'Error al cargar datos');
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, []);

  async function handleReservar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    try {
      const nuevo = await admisionApi.reservarTurno({
        pacienteId,
        medicoId,
        inicio: new Date(inicio).toISOString(),
        motivoConsulta: motivoConsulta || undefined,
      });

      setMensajeExito(`Turno reservado exitosamente (ID: ${nuevo.id.slice(0, 8)}).`);
      setMotivoConsulta('');
      const tList = await admisionApi.listarTurnos();
      setTurnos(tList);
    } catch (err) {
      setError(
        err instanceof HttpError ? `${err.status}: ${err.message}` : 'Error al reservar turno',
      );
    }
  }

  async function handleCancelar(turnoId: string) {
    if (!window.confirm('¿Desea cancelar este turno?')) return;
    setError(null);
    setMensajeExito(null);

    try {
      await admisionApi.cancelarTurno(turnoId);
      setMensajeExito('Turno cancelado correctamente.');
      const tList = await admisionApi.listarTurnos();
      setTurnos(tList);
    } catch (err) {
      setError(
        err instanceof HttpError ? `${err.status}: ${err.message}` : 'Error al cancelar turno',
      );
    }
  }

  return (
    <section>
      <h2>Módulo 2: Admisión — Turnos</h2>

      {error && <p className="error">{error}</p>}
      {mensajeExito && <p style={{ color: '#2b6cb0' }}>{mensajeExito}</p>}

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginTop: '16px' }}
      >
        {/* Formulario de Reserva */}
        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #d9e2ec',
          }}
        >
          <h3>Reservar Turno</h3>
          <form
            onSubmit={(e) => void handleReservar(e)}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <label style={{ fontSize: '0.85rem' }}>
              Paciente:
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
              Médico:
              <select
                required
                value={medicoId}
                onChange={(e) => setMedicoId(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombreCompleto} — {m.especialidad}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: '0.85rem' }}>
              Fecha y Hora:
              <input
                type="datetime-local"
                required
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            <label style={{ fontSize: '0.85rem' }}>
              Motivo de consulta:
              <input
                placeholder="Ej. Chequeo anual, dolor articular"
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            <button type="submit" style={{ marginTop: '8px' }}>
              Confirmar Reserva
            </button>
          </form>
        </div>

        {/* Listado de Turnos */}
        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #d9e2ec',
          }}
        >
          <h3>Turnos Programados</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '6px' }}>Horario</th>
                <th style={{ padding: '6px' }}>Paciente</th>
                <th style={{ padding: '6px' }}>Médico</th>
                <th style={{ padding: '6px' }}>Estado</th>
                <th style={{ padding: '6px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => {
                const pac = pacientes.find((p) => p.id === t.pacienteId);
                const med = medicos.find((m) => m.id === t.medicoId);
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '6px' }}>{new Date(t.inicio).toLocaleString()}</td>
                    <td style={{ padding: '6px' }}>
                      {pac ? `${pac.apellido}, ${pac.nombre}` : t.pacienteId.slice(0, 8)}
                    </td>
                    <td style={{ padding: '6px' }}>
                      {med ? med.nombreCompleto : t.medicoId.slice(0, 8)}
                    </td>
                    <td style={{ padding: '6px' }}>
                      <span
                        className={`badge ${
                          t.estado === 'RESERVADO'
                            ? 'badge-ok'
                            : t.estado === 'CANCELADO'
                              ? 'badge-error'
                              : 'badge-warn'
                        }`}
                      >
                        {t.estado}
                      </span>
                    </td>
                    <td style={{ padding: '6px' }}>
                      {t.estado === 'RESERVADO' && (
                        <button
                          type="button"
                          onClick={() => void handleCancelar(t.id)}
                          style={{ color: '#c53030', cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {turnos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '16px', color: '#718096' }}
                  >
                    No hay turnos registrados.
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
