import { type FormEvent, useEffect, useState } from 'react';
import { HttpError } from '../../api/http';
import { admisionApi, type PacienteItem } from './api/admision.api';

export function PacientesPage() {
  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario nuevo paciente
  const [tipoDocumento, setTipoDocumento] = useState('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('M');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [obraSocialCodigo, setObraSocialCodigo] = useState('PARTICULAR');
  const [numeroAfiliado, setNumeroAfiliado] = useState('');

  const cargarPacientes = (filtro?: string) => {
    setError(null);
    admisionApi
      .buscarPacientes({ apellido: filtro, documento: filtro })
      .then(setPacientes)
      .catch((e) => {
        setError(
          e instanceof HttpError ? `${e.status}: ${e.message}` : 'Error al cargar pacientes',
        );
        setPacientes([]);
      });
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  async function handleBuscar(e: FormEvent) {
    e.preventDefault();
    cargarPacientes(busqueda);
  }

  async function handleRegistrar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    try {
      const nuevo = await admisionApi.registrarPaciente({
        tipoDocumento,
        numeroDocumento,
        nombre,
        apellido,
        fechaNacimiento,
        sexo,
        telefono: telefono || undefined,
        email: email || undefined,
        obraSocialCodigo: obraSocialCodigo || undefined,
        numeroAfiliado: numeroAfiliado || undefined,
      });

      setMensajeExito(`Paciente ${nuevo.nombre} ${nuevo.apellido} registrado exitosamente.`);
      setNumeroDocumento('');
      setNombre('');
      setApellido('');
      setFechaNacimiento('');
      setTelefono('');
      setEmail('');
      setNumeroAfiliado('');
      cargarPacientes();
    } catch (err) {
      setError(
        err instanceof HttpError ? `${err.status}: ${err.message}` : 'Error al registrar paciente',
      );
    }
  }

  return (
    <section>
      <h2>Módulo 2: Admisión — Pacientes</h2>

      {error && <p className="error">{error}</p>}
      {mensajeExito && <p style={{ color: '#2b6cb0' }}>{mensajeExito}</p>}

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}
      >
        {/* Formulario de Alta */}
        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #d9e2ec',
          }}
        >
          <h3>Registrar Nuevo Paciente</h3>
          <form
            onSubmit={(e) => void handleRegistrar(e)}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div className="fila">
              <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="OTRO">Otro</option>
              </select>
              <input
                required
                placeholder="Número Documento"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
              />
            </div>

            <div className="fila">
              <input
                required
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <input
                required
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>

            <div className="fila">
              <label style={{ fontSize: '0.85rem' }}>
                F. Nacimiento:
                <input
                  type="date"
                  required
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </label>

              <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                <option value="F">Femenino (F)</option>
                <option value="M">Masculino (M)</option>
                <option value="X">No binario (X)</option>
              </select>
            </div>

            <div className="fila">
              <input
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="fila">
              <select
                value={obraSocialCodigo}
                onChange={(e) => setObraSocialCodigo(e.target.value)}
              >
                <option value="PARTICULAR">Particular</option>
                <option value="OSDE">OSDE</option>
                <option value="PAMI">PAMI</option>
              </select>
              <input
                placeholder="Número de Afiliado"
                value={numeroAfiliado}
                onChange={(e) => setNumeroAfiliado(e.target.value)}
              />
            </div>

            <button type="submit" style={{ marginTop: '8px' }}>
              Dar de Alta Paciente
            </button>
          </form>
        </div>

        {/* Búsqueda y Resultados */}
        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #d9e2ec',
          }}
        >
          <h3>Buscar Pacientes</h3>
          <form
            onSubmit={(e) => void handleBuscar(e)}
            className="fila"
            style={{ marginBottom: '12px' }}
          >
            <input
              placeholder="Buscar por documento o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit">Buscar</button>
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                cargarPacientes();
              }}
            >
              Limpiar
            </button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '6px' }}>Documento</th>
                <th style={{ padding: '6px' }}>Paciente</th>
                <th style={{ padding: '6px' }}>Sexo / Edad</th>
                <th style={{ padding: '6px' }}>Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '6px' }}>
                    {p.tipoDocumento} {p.numeroDocumento}
                  </td>
                  <td style={{ padding: '6px' }}>
                    {p.apellido}, {p.nombre}
                  </td>
                  <td style={{ padding: '6px' }}>
                    {p.sexo} ({p.fechaNacimiento})
                  </td>
                  <td style={{ padding: '6px' }}>{p.obraSocialCodigo || 'Particular'}</td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: 'center', padding: '16px', color: '#718096' }}
                  >
                    No se encontraron pacientes.
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
