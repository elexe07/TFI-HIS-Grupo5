/**
 * Reglas de arquitectura (fitness functions). Se ejecutan con `pnpm arch` y en CI.
 * Si una regla falla, el build falla. Ver ROADMAP.md §4.3.
 *
 * Anatomía de un módulo: src/modules/<modulo>/{domain,application,infrastructure,api,public}
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-depende-de-capas-externas',
      comment: 'El dominio es el centro: no conoce application, infrastructure ni api.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/domain/' },
      to: { path: '^src/modules/$1/(application|infrastructure|api)/' },
    },
    {
      name: 'domain-sin-frameworks',
      comment: 'El dominio no importa NestJS, Prisma ni librerías de validación HTTP.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/domain/' },
      to: {
        dependencyTypes: ['npm', 'npm-dev'],
        path: '(@nestjs|@prisma|class-validator|class-transformer|express)',
      },
    },
    {
      name: 'application-no-depende-de-infra-ni-api',
      comment: 'Los casos de uso hablan con puertos, no con adaptadores.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/application/' },
      to: { path: '^src/modules/$1/(infrastructure|api)/' },
    },
    {
      name: 'nucleo-no-usa-prisma',
      comment:
        'Ni dominio ni aplicación pueden importar PrismaService u otra infraestructura compartida.',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/(domain|application)/' },
      to: { path: '^src/building-blocks/infrastructure/' },
    },
    {
      name: 'api-no-depende-de-infraestructura',
      comment: 'Los controllers mapean request → caso de uso. No tocan repositorios.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/api/' },
      to: { path: '^src/modules/$1/infrastructure/' },
    },
    {
      name: 'aislamiento-entre-modulos',
      comment: 'Un módulo solo puede importar de otro lo que está en su carpeta public/.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/',
        pathNot: ['^src/modules/$1/', '^src/modules/[^/]+/public/'],
      },
    },
    {
      name: 'building-blocks-no-conoce-modulos',
      comment: 'El shared kernel es genérico; no sabe nada del negocio.',
      severity: 'error',
      from: { path: '^src/building-blocks/' },
      to: { path: '^src/modules/' },
    },
    {
      name: 'sin-ciclos',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'sin-huerfanos',
      comment: 'Archivo que nadie importa: probablemente código muerto.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: ['\\.d\\.ts$', '(^|/)main\\.ts$', '\\.spec\\.ts$', '(^|/)index\\.ts$'],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.spec\\.ts$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
    },
  },
};
