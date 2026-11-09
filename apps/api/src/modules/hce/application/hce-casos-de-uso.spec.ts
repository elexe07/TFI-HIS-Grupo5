import { EventBusEnMemoria, RelojFijo } from '../../../building-blocks/testing';
import { HistoriaClinica } from '../domain/historia-clinica';
import { HistoriaClinicaRepositoryEnMemoria } from '../infrastructure/historia-clinica.repository.en-memoria';
import {
  AbrirHistoriaCommand,
  AbrirHistoriaHandler,
} from './abrir-historia/abrir-historia.handler';
import {
  ConsultarHistoriaHandler,
  ConsultarHistoriaQuery,
} from './consultar-historia/consultar-historia.handler';
import {
  CrearPrescripcionCommand,
  CrearPrescripcionHandler,
} from './crear-prescripcion/crear-prescripcion.handler';
import {
  RegistrarAlergiaCommand,
  RegistrarAlergiaHandler,
} from './registrar-alergia/registrar-alergia.handler';
import {
  RegistrarAntecedenteCommand,
  RegistrarAntecedenteHandler,
} from './registrar-antecedente/registrar-antecedente.handler';
import {
  RegistrarEstudioCommand,
  RegistrarEstudioHandler,
} from './registrar-estudio/registrar-estudio.handler';
import {
  RegistrarEvolucionCommand,
  RegistrarEvolucionHandler,
} from './registrar-evolucion/registrar-evolucion.handler';

describe('Casos de Uso HCE (Fase 4 ROADMAP)', () => {
  let repo: HistoriaClinicaRepositoryEnMemoria;
  let bus: EventBusEnMemoria;
  let reloj: RelojFijo;

  const pacienteId = 'paciente-uuid-1';
  const medicoId = 'medico-uuid-1';
  const ahora = new Date('2026-11-04T10:00:00Z');

  beforeEach(() => {
    repo = new HistoriaClinicaRepositoryEnMemoria();
    bus = new EventBusEnMemoria();
    reloj = new RelojFijo(ahora);
  });

  describe('HCE-01: Abrir historia (idempotente por evento)', () => {
    it('debería abrir la historia clínica y no duplicar si el evento llega dos veces', async () => {
      const handler = new AbrirHistoriaHandler(repo, reloj);

      const res1 = await handler.ejecutar(new AbrirHistoriaCommand(pacienteId, 'evento-1'));
      const res2 = await handler.ejecutar(new AbrirHistoriaCommand(pacienteId, 'evento-1'));

      expect(res1.id).toBe(res2.id);
      const guardada = await repo.buscarPorPacienteId(pacienteId);
      expect(guardada).toBeDefined();
    });
  });

  describe('HCE-02: Registrar evolución (inmutable, emite EvolucionRegistrada)', () => {
    it('debería registrar la evolución y emitir el evento para Facturación', async () => {
      await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

      const handler = new RegistrarEvolucionHandler(repo, bus, reloj);
      const res = await handler.ejecutar(
        new RegistrarEvolucionCommand(
          pacienteId,
          medicoId,
          'Dolor de cabeza agudo',
          'Cefalea tensional',
          'Reposo e hidratación',
          'turno-1',
        ),
      );

      expect(res.id).toBeDefined();
      expect(bus.publicados).toHaveLength(1);
      expect(bus.publicados[0]?.nombre).toBe('hce.evolucion-registrada');
    });
  });

  describe('HCE-03: Registrar alergia', () => {
    it('debería registrar una alergia y lanzar error si está duplicada', async () => {
      await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

      const handler = new RegistrarAlergiaHandler(repo, reloj);
      await handler.ejecutar(
        new RegistrarAlergiaCommand(pacienteId, 'Amoxicilina', 'GRAVE', medicoId),
      );

      await expect(
        handler.ejecutar(
          new RegistrarAlergiaCommand(pacienteId, 'amoxicilina', 'MODERADA', medicoId),
        ),
      ).rejects.toThrow("La sustancia 'amoxicilina' ya está registrada");
    });
  });

  describe('HCE-04: Registrar antecedente familiar', () => {
    it('debería registrar un antecedente familiar', async () => {
      await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

      const handler = new RegistrarAntecedenteHandler(repo, reloj);
      const res = await handler.ejecutar(
        new RegistrarAntecedenteCommand(pacienteId, 'Padre', 'Diabetes Tipo 2', medicoId),
      );

      expect(res.id).toBeDefined();
    });
  });

  describe('HCE-05: Crear prescripción (bloquea si hay alergia)', () => {
    it('debería bloquear si el paciente es alérgico', async () => {
      const historia = HistoriaClinica.abrir(pacienteId, ahora);
      historia.registrarAlergia('Penicilina', 'GRAVE', ahora, medicoId);
      await repo.guardar(historia);

      const handler = new CrearPrescripcionHandler(repo, bus, reloj);

      await expect(
        handler.ejecutar(
          new CrearPrescripcionCommand(pacienteId, medicoId, 'Penicilina G', '1000 UI', 12, 7),
        ),
      ).rejects.toThrow('el paciente presenta alergia');
    });

    it('debería permitir prescribir si no es alérgico y emitir PrescripcionCreada', async () => {
      await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

      const handler = new CrearPrescripcionHandler(repo, bus, reloj);
      const res = await handler.ejecutar(
        new CrearPrescripcionCommand(pacienteId, medicoId, 'Loratadina', '10 mg', 24, 10),
      );

      expect(res.id).toBeDefined();
      expect(bus.publicados).toHaveLength(1);
      expect(bus.publicados[0]?.nombre).toBe('hce.prescripcion-creada');
    });
  });

  describe('HCE-06: Registrar estudio', () => {
    it('debería registrar un estudio médico', async () => {
      await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

      const handler = new RegistrarEstudioHandler(repo, reloj);
      const res = await handler.ejecutar(
        new RegistrarEstudioCommand(
          pacienteId,
          'IMAGEN',
          'Radiografía de tórax',
          new Date('2026-11-04'),
          medicoId,
          'Sin particularidades',
        ),
      );

      expect(res.id).toBeDefined();
    });
  });

  describe('HCE-07: Consultar historia clínica', () => {
    it('médico puede consultar la historia completa', async () => {
      const historia = HistoriaClinica.abrir(pacienteId, ahora);
      historia.registrarAlergia('Polen', 'LEVE', ahora, medicoId);
      await repo.guardar(historia);

      const handler = new ConsultarHistoriaHandler(repo);
      const resultado = await handler.ejecutar(
        new ConsultarHistoriaQuery(pacienteId, {
          id: medicoId,
          rol: 'MEDICO',
        }),
      );

      expect(resultado.pacienteId).toBe(pacienteId);
      expect(resultado.alergias).toHaveLength(1);
    });

    it('paciente no puede consultar historia de otro paciente', async () => {
      await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

      const handler = new ConsultarHistoriaHandler(repo);
      await expect(
        handler.ejecutar(
          new ConsultarHistoriaQuery(pacienteId, {
            id: 'usuario-paciente-2',
            rol: 'PACIENTE',
            pacienteId: 'otro-paciente-id',
          }),
        ),
      ).rejects.toThrow('No tiene permisos para acceder');
    });
  });
});
