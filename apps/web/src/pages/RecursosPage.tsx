import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { getToken, HttpError, http, setToken } from '../api/http';

export type EstadoCama = 'LIBRE' | 'OCUPADA' | 'EN_LIMPIEZA' | 'BLOQUEADA';

export interface CamaMapa {
  id: string;
  codigo: string;
  estado: EstadoCama;
  internacionActiva?: {
    id: string;
    pacienteId: string;
    ingresoEn: string;
    medicoId: string;
  } | null;
}

export interface HabitacionMapa {
  id: string;
  sector: string;
  numero: string;
  camas: CamaMapa[];
}

export interface TotalesCamas {
  libre: number;
  ocupada: number;
  enLimpieza: number;
  bloqueada: number;
  total: number;
}

export interface MapaCamasRespuesta {
  totales: TotalesCamas;
  habitaciones: HabitacionMapa[];
}

export interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  medicamentoAsociado: string | null;
  stockActual: number;
  stockMinimo: number;
  bajoMinimo: boolean;
  updatedAt: string;
}

export function RecursosPage() {
  const [tab, setTab] = useState<'camas' | 'insumos'>('camas');
  const [mapa, setMapa] = useState<MapaCamasRespuesta | null>(null);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [autenticado, setAutenticado] = useState<boolean>(Boolean(getToken()));

  // Modales
  const [camaParaInternar, setCamaParaInternar] = useState<CamaMapa | null>(null);
  const [formInternar, setFormInternar] = useState({
    pacienteId: '',
    medicoId: '',
    motivo: '',
  });

  const [insumoParaIngreso, setInsumoParaIngreso] = useState<Insumo | null>(null);
  const [cantidadIngreso, setCantidadIngreso] = useState<number>(10);

  const cargarMapa = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await http.get<MapaCamasRespuesta>('/api/camas/mapa');
      setMapa(data);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : 'Error al cargar mapa de camas');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarInsumos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const query = soloBajoMinimo ? '?bajoMinimo=true' : '';
      const data = await http.get<Insumo[]>(`/api/insumos${query}`);
      setInsumos(data);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : 'Error al cargar inventario de insumos');
    } finally {
      setCargando(false);
    }
  }, [soloBajoMinimo]);

  useEffect(() => {
    if (tab === 'camas') {
      void cargarMapa();
    } else {
      void cargarInsumos();
    }
  }, [tab, cargarMapa, cargarInsumos]);

  async function iniciarSesionAdmin() {
    try {
      setError(null);
      const res = await http.post<{ token: string }>('/api/auth/login', {
        email: 'admin@his.local',
        password: 'Admin1234!',
      });
      setToken(res.token);
      setAutenticado(true);
      setMensaje('Sesión iniciada como Administrador (admin@his.local)');
      if (tab === 'camas') void cargarMapa();
      else void cargarInsumos();
    } catch (e) {
      setError(e instanceof HttpError ? e.message : 'Error al iniciar sesión');
    }
  }

  function cerrarSesion() {
    setToken(null);
    setAutenticado(false);
    setMensaje('Sesión cerrada');
  }

  async function cambiarEstado(camaId: string, nuevoEstado: EstadoCama) {
    try {
      setError(null);
      await http.patch(`/api/camas/${camaId}/estado`, { estado: nuevoEstado });
      setMensaje(`Cama actualizada a ${nuevoEstado}`);
      await cargarMapa();
    } catch (e) {
      setError(e instanceof HttpError ? e.message : 'Error al cambiar estado de cama');
    }
  }

  async function darDeAlta(internacionId: string) {
    if (!confirm('¿Confirma dar de alta al paciente de esta cama?')) return;
    try {
      setError(null);
      await http.post(`/api/internaciones/${internacionId}/alta`, {});
      setMensaje('Internación finalizada. Cama en limpieza.');
      await cargarMapa();
    } catch (e) {
      setError(e instanceof HttpError ? e.message : 'Error al dar de alta');
    }
  }

  async function ejecutarInternacion(e: FormEvent) {
    e.preventDefault();
    if (!camaParaInternar) return;
    try {
      setError(null);
      await http.post('/api/internaciones', {
        camaId: camaParaInternar.id,
        pacienteId: formInternar.pacienteId,
        medicoId: formInternar.medicoId,
        motivo: formInternar.motivo,
      });
      setCamaParaInternar(null);
      setFormInternar({ pacienteId: '', medicoId: '', motivo: '' });
      setMensaje('Paciente internado exitosamente.');
      await cargarMapa();
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Error al internar paciente');
    }
  }

  async function ejecutarIngresoStock(e: FormEvent) {
    e.preventDefault();
    if (!insumoParaIngreso) return;
    try {
      setError(null);
      await http.post(`/api/insumos/${insumoParaIngreso.id}/ingresos`, {
        cantidad: Number(cantidadIngreso),
      });
      setInsumoParaIngreso(null);
      setMensaje('Stock de insumo ingresado con éxito.');
      await cargarInsumos();
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Error al registrar ingreso de stock');
    }
  }

  return (
    <div className="recursos-container">
      <div className="auth-banner">
        <span>
          {autenticado ? (
            <strong>Sesión activa con token de autenticación</strong>
          ) : (
            <span>No autenticado (los endpoints protegidos requieren token)</span>
          )}
        </span>
        {autenticado ? (
          <button className="secundario" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        ) : (
          <button onClick={() => void iniciarSesionAdmin()}>
            Iniciar sesión como Admin
          </button>
        )}
      </div>

      <div className="tabs-nav">
        <button
          className={tab === 'camas' ? 'activo' : ''}
          onClick={() => setTab('camas')}
        >
          Mapa de Camas
        </button>
        <button
          className={tab === 'insumos' ? 'activo' : ''}
          onClick={() => setTab('insumos')}
        >
          Inventario de Insumos
        </button>
      </div>

      {mensaje && (
        <div className="mensaje-exito" onClick={() => setMensaje(null)}>
          {mensaje}
        </div>
      )}
      {error && (
        <div className="error" onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {/* ================= MAPA DE CAMAS ================= */}
      {tab === 'camas' && (
        <section>
          {mapa && (
            <div className="metricas-grid">
              <div className="metrica-card total">
                <span className="titulo">Total Camas</span>
                <span className="valor">{mapa.totales.total}</span>
              </div>
              <div className="metrica-card libre">
                <span className="titulo">Libres</span>
                <span className="valor">{mapa.totales.libre}</span>
              </div>
              <div className="metrica-card ocupada">
                <span className="titulo">Ocupadas</span>
                <span className="valor">{mapa.totales.ocupada}</span>
              </div>
              <div className="metrica-card en_limpieza">
                <span className="titulo">En Limpieza</span>
                <span className="valor">{mapa.totales.enLimpieza}</span>
              </div>
              <div className="metrica-card bloqueada">
                <span className="titulo">Bloqueadas</span>
                <span className="valor">{mapa.totales.bloqueada}</span>
              </div>
            </div>
          )}

          <div style={{ margin: '20px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Distribución por Habitación</h2>
            <button className="secundario" onClick={() => void cargarMapa()} disabled={cargando}>
              {cargando ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {mapa?.habitaciones.map((hab) => (
            <div key={hab.id} className="habitacion-card">
              <div className="habitacion-header">
                <h3>
                  Sector {hab.sector} — Habitación {hab.numero}
                </h3>
                <span className="badge">{hab.camas.length} camas</span>
              </div>

              <div className="camas-grid">
                {hab.camas.map((cama) => (
                  <div key={cama.id} className={`cama-box estado-${cama.estado}`}>
                    <div>
                      <div className="cama-header">
                        <span className="cama-codigo">{cama.codigo}</span>
                        <span className={`cama-tag ${cama.estado}`}>{cama.estado}</span>
                      </div>

                      <div className="cama-detalle">
                        {cama.estado === 'OCUPADA' && cama.internacionActiva && (
                          <div>
                            <div><strong>Paciente:</strong> {cama.internacionActiva.pacienteId.slice(0, 8)}...</div>
                            <div><strong>Ingreso:</strong> {new Date(cama.internacionActiva.ingresoEn).toLocaleDateString()}</div>
                          </div>
                        )}
                        {cama.estado === 'LIBRE' && <div>Cama disponible para internación</div>}
                        {cama.estado === 'EN_LIMPIEZA' && <div>Pendiente de higienización y desinfección</div>}
                        {cama.estado === 'BLOQUEADA' && <div>Fuera de servicio / Bloqueada temporalmente</div>}
                      </div>
                    </div>

                    <div className="cama-acciones">
                      {cama.estado === 'LIBRE' && (
                        <>
                          <button
                            onClick={() => {
                              setCamaParaInternar(cama);
                              setFormInternar({
                                pacienteId: '00000000-0000-0000-0000-000000000001',
                                medicoId: '00000000-0000-0000-0000-000000000002',
                                motivo: 'Internación clínica',
                              });
                            }}
                          >
                            Internar
                          </button>
                          <button
                            className="secundario"
                            onClick={() => void cambiarEstado(cama.id, 'BLOQUEADA')}
                          >
                            Bloquear
                          </button>
                        </>
                      )}

                      {cama.estado === 'OCUPADA' && cama.internacionActiva && (
                        <button
                          className="peligro"
                          onClick={() => void darDeAlta(cama.internacionActiva!.id)}
                        >
                          Dar de Alta
                        </button>
                      )}

                      {cama.estado === 'EN_LIMPIEZA' && (
                        <button onClick={() => void cambiarEstado(cama.id, 'LIBRE')}>
                          Marcar Limpia
                        </button>
                      )}

                      {cama.estado === 'BLOQUEADA' && (
                        <button
                          className="secundario"
                          onClick={() => void cambiarEstado(cama.id, 'LIBRE')}
                        >
                          Desbloquear
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ================= INVENTARIO DE INSUMOS ================= */}
      {tab === 'insumos' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Inventario de Insumos y Medicamentos</h2>
            <div className="fila">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={soloBajoMinimo}
                  onChange={(e) => setSoloBajoMinimo(e.target.checked)}
                />
                Solo bajo mínimo (REC-07)
              </label>
              <button className="secundario" onClick={() => void cargarInsumos()} disabled={cargando}>
                {cargando ? 'Cargando...' : 'Refrescar'}
              </button>
            </div>
          </div>

          <table className="tabla-insumos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Medicamento Asociado</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.codigo}</strong></td>
                  <td>{i.nombre}</td>
                  <td>{i.medicamentoAsociado ?? '—'}</td>
                  <td><strong>{i.stockActual}</strong></td>
                  <td>{i.stockMinimo}</td>
                  <td>
                    {i.bajoMinimo ? (
                      <span className="pill-alerta">BAJO MÍNIMO</span>
                    ) : (
                      <span className="pill-normal">NORMAL</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="secundario"
                      onClick={() => {
                        setInsumoParaIngreso(i);
                        setCantidadIngreso(10);
                      }}
                    >
                      + Ingresar Stock
                    </button>
                  </td>
                </tr>
              ))}
              {insumos.length === 0 && !cargando && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
                    No se encontraron insumos con el filtro aplicado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Modal Internar */}
      {camaParaInternar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Internar en Cama {camaParaInternar.codigo}</h3>
            <form onSubmit={(e) => void ejecutarInternacion(e)}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>ID Paciente (UUID):</label>
                <input
                  required
                  value={formInternar.pacienteId}
                  onChange={(e) => setFormInternar({ ...formInternar, pacienteId: e.target.value })}
                  placeholder="UUID del paciente"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>ID Médico (UUID):</label>
                <input
                  required
                  value={formInternar.medicoId}
                  onChange={(e) => setFormInternar({ ...formInternar, medicoId: e.target.value })}
                  placeholder="UUID del médico"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Motivo:</label>
                <input
                  required
                  value={formInternar.motivo}
                  onChange={(e) => setFormInternar({ ...formInternar, motivo: e.target.value })}
                  placeholder="Motivo de internación"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div className="modal-acciones">
                <button type="button" className="secundario" onClick={() => setCamaParaInternar(null)}>
                  Cancelar
                </button>
                <button type="submit">Confirmar Internación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ingreso Stock */}
      {insumoParaIngreso && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ingreso de Stock: {insumoParaIngreso.nombre}</h3>
            <form onSubmit={(e) => void ejecutarIngresoStock(e)}>
              <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#64748b' }}>
                Stock actual: <strong>{insumoParaIngreso.stockActual}</strong> (Mínimo: {insumoParaIngreso.stockMinimo})
              </p>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cantidad a ingresar:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadIngreso}
                  onChange={(e) => setCantidadIngreso(Number(e.target.value))}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div className="modal-acciones">
                <button type="button" className="secundario" onClick={() => setInsumoParaIngreso(null)}>
                  Cancelar
                </button>
                <button type="submit">Registrar Ingreso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
