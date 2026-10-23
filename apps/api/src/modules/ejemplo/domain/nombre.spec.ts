import { Nombre, NombreInvalido } from './nombre';

describe('Nombre', () => {
  it('recorta espacios', () => {
    expect(Nombre.crear('  Ana  ').valor).toBe('Ana');
  });

  it('rechaza vacío', () => {
    expect(() => Nombre.crear('   ')).toThrow(NombreInvalido);
  });

  it('rechaza más de 50 caracteres', () => {
    expect(() => Nombre.crear('a'.repeat(51))).toThrow(NombreInvalido);
  });

  it('dos nombres iguales son iguales', () => {
    expect(Nombre.crear('Ana').equals(Nombre.crear('Ana'))).toBe(true);
  });
});
