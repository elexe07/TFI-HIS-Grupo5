/**
 * Dobles de test del módulo IAM. Los usan los specs de este módulo; otros módulos que quieran
 * probar endpoints protegidos usan `TokensFalsos` para fabricar un usuario autenticado.
 */
export * from './password-hasher.falso';
export * from './rol.repository.en-memoria';
export * from './tokens.falsos';
export * from './usuario.repository.en-memoria';
