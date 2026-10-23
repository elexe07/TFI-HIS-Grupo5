import { SALUDO_CREADO, SaludoCreado } from './events/saludo-creado';
import { Nombre } from './nombre';
import { Saludo } from './saludo';

describe('Saludo', () => {
  const ahora = new Date('2026-03-01T12:00:00Z');

  it('arma el mensaje con el destinatario', () => {
    const saludo = Saludo.crear(Nombre.crear('Ana'), ahora);
    expect(saludo.mensaje).toBe('Hola, Ana');
    expect(saludo.creadoEn).toEqual(ahora);
  });

  it('al crearse registra SaludoCreado con sus datos', () => {
    const saludo = Saludo.crear(Nombre.crear('Ana'), ahora);

    const [evento] = saludo.extraerEventos();

    expect(evento).toBeInstanceOf(SaludoCreado);
    expect(evento?.nombre).toBe(SALUDO_CREADO);
    expect((evento as SaludoCreado).destinatario).toBe('Ana');
  });

  it('reconstituir no dispara eventos', () => {
    const saludo = Saludo.reconstituir('id-1', Nombre.crear('Ana'), ahora);
    expect(saludo.extraerEventos()).toHaveLength(0);
  });
});
