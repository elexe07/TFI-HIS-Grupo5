import { validarEnv } from './env';

describe('validarEnv', () => {
  const minimo = { DATABASE_URL: 'postgresql://x', JWT_SECRET: 's' };

  it('completa valores por defecto', () => {
    const env = validarEnv(minimo);
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.JWT_EXPIRES_IN).toBe('8h');
  });

  it('falla con un mensaje claro si falta DATABASE_URL', () => {
    expect(() => validarEnv({ JWT_SECRET: 's' })).toThrow(/DATABASE_URL/);
  });

  it('convierte PORT a número', () => {
    expect(validarEnv({ ...minimo, PORT: '4000' }).PORT).toBe(4000);
  });
});
