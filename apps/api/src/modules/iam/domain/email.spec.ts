import { Email, EmailInvalido } from './email';

describe('Email', () => {
  it('normaliza a minúsculas y sin espacios', () => {
    expect(Email.crear('  Ana@Hospital.COM ').valor).toBe('ana@hospital.com');
  });

  it('dos emails iguales salvo mayúsculas son iguales', () => {
    expect(Email.crear('ana@h.com').equals(Email.crear('ANA@H.COM'))).toBe(true);
  });

  it.each(['', '   ', 'sin-arroba', 'a@b', '@h.com', 'a b@h.com'])('rechaza "%s"', (valor) => {
    expect(() => Email.crear(valor)).toThrow(EmailInvalido);
  });
});
