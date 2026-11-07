import { Cobertura } from './cobertura';

describe('Cobertura', () => {
  it('debería crearse con obra social y número de afiliado', () => {
    const cob = Cobertura.crear(' OSDE ', ' 123456 ');
    expect(cob.obraSocialCodigo).toBe('OSDE');
    expect(cob.numeroAfiliado).toBe('123456');
  });

  it('debería convertir strings vacíos a null', () => {
    const cob = Cobertura.crear('   ', '   ');
    expect(cob.obraSocialCodigo).toBeNull();
    expect(cob.numeroAfiliado).toBeNull();
  });

  it('debería soportar particular()', () => {
    const cob = Cobertura.particular();
    expect(cob.obraSocialCodigo).toBe('PARTICULAR');
    expect(cob.numeroAfiliado).toBeNull();
  });

  it('debería comparar igualdad por valor', () => {
    const c1 = Cobertura.crear('OSDE', '999');
    const c2 = Cobertura.crear('OSDE', '999');
    const c3 = Cobertura.crear('PAMI', '999');

    expect(c1.equals(c2)).toBe(true);
    expect(c1.equals(c3)).toBe(false);
  });
});

