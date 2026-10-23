import { type FormEvent, useEffect, useState } from 'react';
import { HttpError, http } from '../api/http';

interface Indicacion {
  id: string;
  internacionId: string;
  pacienteId: string;
  prescripcionId: string;
  descripcion: string;
  programadaPara: string;
  estado: 'PENDIENTE' | 'EJECUTADA' | 'OMITIDA';
  motivoOmision: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SignosVitales {
  id: string;
  pacienteId: string;
  internacionId: string | null;
  temperatura: number | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  frecuenciaCardiaca: number | null;
  saturacionO2: number | null;
  registradoEn: string;
  registradoPor: string;
}

interface NotaEnfermeria {
  id: string;
  pacienteId: string;
  internacionId: string | null;
  texto: string;
  registradoEn: string;
  registradoPor: string;
}

export function EnfermeriaPage() {
  const [tab, setTab] = useState<'indicaciones' | 'signos' | 'notas'>('indicaciones');

  // Contexto del paciente / internación
  const [pacienteId, setPacienteId] = useState('11111111-1111-4111-8111-111111111111');
  const [internacionId, setInternacionId] = useState('22222222-2222-4222-8222-222222222222');

  // Token de sesión
  const [token, setToken] = useState(http.getToken() ?? '');
  const [emailLogin, setEmailLogin] = useState('admin@his.local');
  const [passwordLogin, setPasswordLogin] = useState('Admin1234!');

  // Datos
  const [indicaciones, setIndicaciones] = useState<Indicacion[]>([]);
  const [signos, setSignos] = useState<SignosVitales[]>([]);
  const [notas, setNotas] = useState<NotaEnfermeria[]>([]);

  // Estados de carga / mensaje
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Formulario Signos Vitales
  const [temperatura, setTemperatura] = useState('36.6');
  const [presionSistolica, setPresionSistolica] = useState('120');
  const [presionDiastolica, setPresionDiastolica] = useState('80');
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState('72');
  const [saturacionO2, setSaturacionO2] = useState('98');

  // Formulario Notas
  const [textoNota, setTextoNota] = useState('');

  // Formulario Omitir Indicación
  const [idOmision, setIdOmision] = useState<string | null>(null);
  const [motivoOmision, setMotivoOmision] = useState('');

  const cargarDatos = async () => {
    try {
      setError(null);
      const [inds, svs, nts] = await Promise.all([
        http.get<Indicacion[]>(`/api/enfermeria/indicaciones?pacienteId=${pacienteId}`),
        http.get<SignosVitales[]>(`/api/enfermeria/signos-vitales?pacienteId=${pacienteId}`),
        http.get<NotaEnfermeria[]>(`/api/enfermeria/notas?pacienteId=${pacienteId}`),
      ]);
      setIndicaciones(inds);
      setSignos(svs);
      setNotas(nts);
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) {
        setError('Debe iniciar sesión para acceder a las funciones de enfermería.');
      } else {
        setError(e instanceof Error ? e.message : 'Error al cargar datos');
      }
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, [pacienteId]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await http.post<{ token: string }>('/api/auth/login', {
        email: emailLogin,
        password: passwordLogin,
      });
      http.setToken(res.token);
      setToken(res.token);
      setMensaje('Sesión iniciada correctamente');
      setTimeout(() => setMensaje(null), 3000);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    }
  }

  function cerrarSesion() {
    http.setToken(null);
    setToken('');
    setMensaje('Sesión cerrada');
    setTimeout(() => setMensaje(null), 2000);
  }

  async function simularPrescripcion() {
    setError(null);
    try {
      const prescripcionId = crypto.randomUUID();
      await http.post('/api/enfermeria/indicaciones/generar', {
        prescripcionId,
        pacienteId,
        internacionId,
        medicamento: 'Amoxicilina',
        dosis: '500 mg',
        frecuenciaHoras: 8,
        duracionDias: 1,
        inicioEn: new Date().toISOString(),
      });
      setMensaje('Indicaciones generadas a partir de la prescripción');
      setTimeout(() => setMensaje(null), 3000);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar indicaciones');
    }
  }

  async function administrarIndicacion(id: string) {
    setError(null);
    try {
      await http.post(`/api/enfermeria/indicaciones/${id}/administrar`);
      setMensaje('Medicación administrada y stock notificado');
      setTimeout(() => setMensaje(null), 3000);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al administrar medicación');
    }
  }

  async function confirmarOmision(e: FormEvent) {
    e.preventDefault();
    if (!idOmision || !motivoOmision.trim()) return;
    setError(null);
    try {
      await http.post(`/api/enfermeria/indicaciones/${idOmision}/omitir`, {
        motivo: motivoOmision.trim(),
      });
      setIdOmision(null);
      setMotivoOmision('');
      setMensaje('Indicación médica omitida con motivo registrado');
      setTimeout(() => setMensaje(null), 3000);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al omitir indicación');
    }
  }

  async function guardarSignos(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await http.post('/api/enfermeria/signos-vitales', {
        pacienteId,
        internacionId: internacionId || undefined,
        temperatura: temperatura ? parseFloat(temperatura) : undefined,
        presionSistolica: presionSistolica ? parseInt(presionSistolica, 10) : undefined,
        presionDiastolica: presionDiastolica ? parseInt(presionDiastolica, 10) : undefined,
        frecuenciaCardiaca: frecuenciaCardiaca ? parseInt(frecuenciaCardiaca, 10) : undefined,
        saturacionO2: saturacionO2 ? parseInt(saturacionO2, 10) : undefined,
      });
      setMensaje('Signos vitales guardados exitosamente');
      setTimeout(() => setMensaje(null), 3000);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar signos vitales');
    }
  }

  async function guardarNota(e: FormEvent) {
    e.preventDefault();
    if (!textoNota.trim()) return;
    setError(null);
    try {
      await http.post('/api/enfermeria/notas', {
        pacienteId,
        internacionId: internacionId || undefined,
        texto: textoNota.trim(),
      });
      setTextoNota('');
      setMensaje('Nota de enfermería registrada');
      setTimeout(() => setMensaje(null), 3000);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar nota');
    }
  }

  return (
    <section>
      <h2>Módulo 4: Atención y Enfermería</h2>
      <p>
        Control de signos vitales, administración de medicación prescrita, ejecución de indicaciones
        médicas y notas de enfermería.
      </p>

      {/* Autenticación rápida */}
      <div className="card">
        <h3>Autenticación</h3>
        {token ? (
          <div className="fila">
            <span className="badge badge-ok">Sesión Activa</span>
            <button type="button" className="secundario" onClick={cerrarSesion}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void login(e)} className="fila">
            <input
              type="email"
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={passwordLogin}
              onChange={(e) => setPasswordLogin(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <button type="submit">Iniciar Sesión</button>
          </form>
        )}
      </div>

      {/* Contexto del Paciente */}
      <div className="card">
        <h3>Contexto de Atención</h3>
        <div className="grid-campos">
          <div className="campo">
            <label>ID Paciente (UUID):</label>
            <input
              type="text"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
            />
          </div>
          <div className="campo">
            <label>ID Internación (UUID):</label>
            <input
              type="text"
              value={internacionId}
              onChange={(e) => setInternacionId(e.target.value)}
            />
          </div>
        </div>
      </div>

      {mensaje && <p className="exito">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      {/* Navegación por pestañas */}
      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${tab === 'indicaciones' ? 'activo' : ''}`}
          onClick={() => setTab('indicaciones')}
        >
          Indicaciones ({indicaciones.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === 'signos' ? 'activo' : ''}`}
          onClick={() => setTab('signos')}
        >
          Signos Vitales ({signos.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === 'notas' ? 'activo' : ''}`}
          onClick={() => setTab('notas')}
        >
          Notas de Evolución ({notas.length})
        </button>
      </div>

      {/* Tab Indicaciones */}
      {tab === 'indicaciones' && (
        <div className="card">
          <div className="fila" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>Indicaciones Médicas Programadas</h3>
            <button type="button" onClick={() => void simularPrescripcion()}>
              + Simular Prescripción Médica (3 dosis)
            </button>
          </div>

          {indicaciones.length === 0 ? (
            <p>No hay indicaciones registradas para este paciente.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Medicamento y Dosis</th>
                  <th>Programada Para</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {indicaciones.map((ind) => (
                  <tr key={ind.id}>
                    <td>
                      <strong>{ind.descripcion}</strong>
                    </td>
                    <td>{new Date(ind.programadaPara).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          ind.estado === 'EJECUTADA'
                            ? 'badge-ok'
                            : ind.estado === 'OMITIDA'
                              ? 'badge-warn'
                              : 'badge-info'
                        }`}
                      >
                        {ind.estado}
                      </span>
                    </td>
                    <td>{ind.motivoOmision ? <em>{ind.motivoOmision}</em> : '-'}</td>
                    <td>
                      {ind.estado === 'PENDIENTE' && (
                        <div className="fila">
                          <button
                            type="button"
                            onClick={() => void administrarIndicacion(ind.id)}
                          >
                            Administrar
                          </button>
                          <button
                            type="button"
                            className="secundario"
                            onClick={() => {
                              setIdOmision(ind.id);
                              setMotivoOmision('');
                            }}
                          >
                            Omitir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Modal / formulario para omitir */}
          {idOmision && (
            <div
              className="card"
              style={{
                marginTop: 20,
                border: '1px solid #f59e0b',
                background: '#fffbeb',
              }}
            >
              <h4>Omitir Indicación</h4>
              <form onSubmit={(e) => void confirmarOmision(e)}>
                <div className="campo" style={{ marginBottom: 12 }}>
                  <label>Motivo de la omisión (obligatorio):</label>
                  <input
                    type="text"
                    placeholder="Ej. Paciente en ayunas, dormido o rechaza medicación"
                    value={motivoOmision}
                    onChange={(e) => setMotivoOmision(e.target.value)}
                    required
                  />
                </div>
                <div className="fila">
                  <button type="submit" className="peligro">
                    Confirmar Omisión
                  </button>
                  <button
                    type="button"
                    className="secundario"
                    onClick={() => setIdOmision(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab Signos Vitales */}
      {tab === 'signos' && (
        <div>
          <div className="card">
            <h3>Registrar Nuevos Signos Vitales</h3>
            <form onSubmit={(e) => void guardarSignos(e)}>
              <div className="grid-campos">
                <div className="campo">
                  <label>Temperatura (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    value={temperatura}
                    onChange={(e) => setTemperatura(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label>Presión Sistólica (mmHg):</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={presionSistolica}
                    onChange={(e) => setPresionSistolica(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label>Presión Diastólica (mmHg):</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={presionDiastolica}
                    onChange={(e) => setPresionDiastolica(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label>Frecuencia Cardíaca (lpm):</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={frecuenciaCardiaca}
                    onChange={(e) => setFrecuenciaCardiaca(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label>Saturación O₂ (%):</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={saturacionO2}
                    onChange={(e) => setSaturacionO2(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit">Guardar Signos Vitales</button>
            </form>
          </div>

          <div className="card">
            <h3>Historial de Signos Vitales</h3>
            {signos.length === 0 ? (
              <p>No hay signos vitales registrados para este paciente.</p>
            ) : (
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Temperatura</th>
                    <th>Presión Arterial</th>
                    <th>Frecuencia Cardíaca</th>
                    <th>SpO₂</th>
                  </tr>
                </thead>
                <tbody>
                  {signos.map((s) => (
                    <tr key={s.id}>
                      <td>{new Date(s.registradoEn).toLocaleString()}</td>
                      <td>{s.temperatura !== null ? `${s.temperatura} °C` : '-'}</td>
                      <td>
                        {s.presionSistolica && s.presionDiastolica
                          ? `${s.presionSistolica}/${s.presionDiastolica} mmHg`
                          : '-'}
                      </td>
                      <td>
                        {s.frecuenciaCardiaca !== null ? `${s.frecuenciaCardiaca} lpm` : '-'}
                      </td>
                      <td>{s.saturacionO2 !== null ? `${s.saturacionO2}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab Notas */}
      {tab === 'notas' && (
        <div>
          <div className="card">
            <h3>Nueva Nota de Enfermería</h3>
            <form onSubmit={(e) => void guardarNota(e)}>
              <div className="campo" style={{ marginBottom: 12 }}>
                <label>Texto de la nota:</label>
                <textarea
                  rows={4}
                  value={textoNota}
                  onChange={(e) => setTextoNota(e.target.value)}
                  placeholder="Detallar evolución, cuidados aplicados, respuesta del paciente..."
                  required
                />
              </div>
              <button type="submit">Guardar Nota</button>
            </form>
          </div>

          <div className="card">
            <h3>Historial de Notas de Enfermería</h3>
            {notas.length === 0 ? (
              <p>No hay notas registradas para este paciente.</p>
            ) : (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {notas.map((n) => (
                  <li
                    key={n.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      padding: '12px 0',
                    }}
                  >
                    <p style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>{n.texto}</p>
                    <small style={{ color: '#64748b' }}>
                      Registrada el {new Date(n.registradoEn).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

