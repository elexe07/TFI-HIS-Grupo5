export type Entorno = 'development' | 'test' | 'production';

export interface Env {
  NODE_ENV: Entorno;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

const ENTORNOS: readonly Entorno[] = ['development', 'test', 'production'];
const PUERTO_POR_DEFECTO = 3000;

function requerida(config: Record<string, unknown>, clave: string): string {
  const valor = config[clave];
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new Error(`Falta la variable de entorno ${clave}. Copiá .env.example a .env.`);
  }
  return valor;
}

function entorno(valor: unknown): Entorno {
  return ENTORNOS.includes(valor as Entorno) ? (valor as Entorno) : 'development';
}

/** Valida las variables al arrancar. Si falta algo, la API no levanta y dice qué falta. */
export function validarEnv(config: Record<string, unknown>): Env {
  return {
    NODE_ENV: entorno(config['NODE_ENV']),
    PORT: Number(config['PORT'] ?? PUERTO_POR_DEFECTO),
    DATABASE_URL: requerida(config, 'DATABASE_URL'),
    JWT_SECRET: requerida(config, 'JWT_SECRET'),
    JWT_EXPIRES_IN: typeof config['JWT_EXPIRES_IN'] === 'string' ? config['JWT_EXPIRES_IN'] : '8h',
  };
}
