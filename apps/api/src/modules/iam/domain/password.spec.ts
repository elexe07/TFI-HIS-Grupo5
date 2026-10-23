import { Password, PasswordDebil } from './password';

describe('Password', () => {
  it('acepta 8+ caracteres con letra y número', () => {
    expect(Password.crear('Clave1234').valor).toBe('Clave1234');
  });

  it.each([
    ['corta', 'Ab1'],
    ['solo letras', 'abcdefgh'],
    ['solo números', '12345678'],
    ['demasiado larga', 'a1'.repeat(40)],
  ])('rechaza %s', (_motivo, valor) => {
    expect(() => Password.crear(valor)).toThrow(PasswordDebil);
  });

  it('no se serializa en texto plano', () => {
    expect(JSON.stringify({ p: Password.crear('Clave1234') })).not.toContain('Clave1234');
  });
});
