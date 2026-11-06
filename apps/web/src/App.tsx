import { Link, Route, Routes } from 'react-router-dom';
import { EstadoApi } from './components/EstadoApi';
import { GuardiaPage } from './modules/admision/GuardiaPage';
import { PacientesPage } from './modules/admision/PacientesPage';
import { TurnosPage } from './modules/admision/TurnosPage';
import { SaludosPage } from './pages/SaludosPage';

/**
 * Esqueleto de la SPA. Cada módulo agrega su carpeta en src/modules/<modulo>/ con sus páginas
 * y las registra acá. La UI es un adaptador: no tiene reglas de negocio.
 */
export function App() {
  return (
    <div className="layout">
      <header>
        <h1>HIS</h1>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/pacientes">Pacientes</Link>
          <Link to="/turnos">Turnos</Link>
          <Link to="/guardia">Guardia</Link>
          <Link to="/ejemplo">Ejemplo</Link>
          <a href="/docs" target="_blank" rel="noreferrer">
            Swagger
          </a>
        </nav>
        <EstadoApi />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/turnos" element={<TurnosPage />} />
          <Route path="/guardia" element={<GuardiaPage />} />
          <Route path="/ejemplo" element={<SaludosPage />} />
        </Routes>
      </main>
    </div>
  );
}

function Inicio() {
  return (
    <section>
      <h2>Hospital Information System</h2>
      <p>Módulos: IAM · Admisión y Turnos · HCE · Enfermería · Recursos y Camas · Facturación.</p>
      <p>
        Accedé a <strong>Pacientes</strong>, <strong>Turnos</strong> y <strong>Guardia</strong>{' '}
        desde el menú superior.
      </p>
    </section>
  );
}
