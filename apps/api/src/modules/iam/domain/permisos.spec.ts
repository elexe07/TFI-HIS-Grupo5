import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MATRIZ_PERMISOS, type NombreRol, PERMISOS, type Permiso, ROLES } from './permisos';

/**
 * Fitness function de documentación: la matriz del código y la tabla de
 * `docs/iam-permisos.md` tienen que decir lo mismo. Si alguien cambia una sin la otra, falla.
 */
const DOC = resolve(__dirname, '../../../../../../docs/iam-permisos.md');
const COLUMNAS: readonly NombreRol[] = [
  'ADMINISTRADOR',
  'MEDICO',
  'ENFERMERO',
  'RECEPCIONISTA',
  'PACIENTE',
];

function leerMatrizDelDoc(): Record<NombreRol, Set<string>> {
  const matriz = Object.fromEntries(ROLES.map((r) => [r, new Set<string>()])) as Record<
    NombreRol,
    Set<string>
  >;
  for (const linea of readFileSync(DOC, 'utf8').split('\n')) {
    const celdas = linea.split('|').map((c) => c.trim());
    const codigo = /^`([a-z]+:[a-z]+)`$/.exec(celdas[1] ?? '')?.[1];
    if (!codigo) continue;
    COLUMNAS.forEach((rol, i) => {
      const celda = celdas[i + 2] ?? '';
      if (celda.includes('✔') || celda.startsWith('propi')) matriz[rol].add(codigo);
    });
  }
  return matriz;
}

describe('Catálogo de permisos', () => {
  const todos = Object.values(PERMISOS) as Permiso[];

  it('cada permiso del catálogo está asignado a al menos un rol', () => {
    const asignados = new Set(Object.values(MATRIZ_PERMISOS).flat());
    expect(todos.filter((p) => !asignados.has(p))).toEqual([]);
  });

  it('la matriz solo usa permisos del catálogo y no repite', () => {
    for (const rol of ROLES) {
      const permisos = MATRIZ_PERMISOS[rol];
      expect(new Set(permisos).size).toBe(permisos.length);
      permisos.forEach((p) => expect(todos).toContain(p));
    }
  });

  it('solo el administrador gestiona usuarios y solo el médico escribe la HCE', () => {
    const conPermiso = (p: Permiso) => ROLES.filter((r) => MATRIZ_PERMISOS[r].includes(p));
    expect(conPermiso(PERMISOS.USUARIOS_GESTIONAR)).toEqual(['ADMINISTRADOR']);
    expect(conPermiso(PERMISOS.HCE_ESCRIBIR)).toEqual(['MEDICO']);
    expect(conPermiso(PERMISOS.PRESCRIPCIONES_CREAR)).toEqual(['MEDICO']);
  });

  it('coincide con la tabla de docs/iam-permisos.md', () => {
    const doc = leerMatrizDelDoc();
    for (const rol of ROLES) {
      expect([...doc[rol]].sort()).toEqual([...MATRIZ_PERMISOS[rol]].sort());
    }
    const enDoc = new Set(Object.values(doc).flatMap((s) => [...s]));
    expect([...enDoc].sort()).toEqual([...todos].sort());
  });
});
