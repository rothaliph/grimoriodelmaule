# AGENTS.md

## Propósito
Este repositorio contiene el código fuente de **5etools** (sitio web estático con generación de páginas/datos). Antes de hacer cambios, prioriza mantener compatibilidad con el flujo actual del proyecto y con sus convenciones de formato.

## Estructura del proyecto (alto nivel)
- `*.html` en raíz: páginas principales del sitio.
- `data/`: datasets JSON de contenido; `data/generated/` contiene artefactos generados/minificados.
- `node/`: scripts de generación, limpieza, build y utilidades.
- `scss/` y `css/`: estilos fuente y salida compilada.
- `test/`: tests de datos, JSON, utilidades y unit tests.
- `sw-template.js` y scripts asociados: service worker.

## Stack y entorno
- Node.js `>=24`.
- Proyecto ESM (`"type": "module"`).
- Tooling principal: ESLint, Jest, Stylelint, Sass, Prettier (CSS), scripts Node propios.

## Convenciones de desarrollo
- **Indentación:** usar tabs (no espacios) en código/JSON donde aplique.
- **CSS:** seguir estrategia BEM siempre que sea posible.
- **JSON de datos:**
  - Formato equivalente a `JSON.stringify` con tabs.
  - Un valor por línea y estructura legible.
  - `data/generated/` debe permanecer minificado por ser salida generada.
- **Contenido:** priorizar fidelidad a la fuente oficial (RAW) y evitar introducir homebrew en este repo.
- **Eventos de teclado/mouse:** evitar atajos con `ALT`; preferir combinaciones con `SHIFT`/`CTRL`.
- **Versionado:** usar los scripts de `version-bump` existentes; no inventar flujo alterno.

## Flujo recomendado para cambios
1. Lee `README.md` y `CONTRIBUTING.md` antes de cambios grandes.
2. Haz cambios mínimos y focalizados.
3. Ejecuta validaciones relevantes según el tipo de cambio.
4. Si tocas datos, ejecuta pruebas de datos/JSON/tags.
5. Si tocas estilos, ejecuta lint de CSS.
6. Si tocas JS, ejecuta lint y unit tests.

## Comandos útiles
- Desarrollo local: `npm run serve:dev` (http://localhost:5050/index.html)
- Lint JS: `npm run test:js`
- Unit tests: `npm run test:unit`
- Lint CSS: `npm run test:css:lint`
- Tests de datos: `npm run test:data`
- Tests completos: `npm test`
- Build completo: `npm run build`

## Alcance y seguridad de cambios
- No reformatear masivamente archivos sin necesidad funcional.
- No mezclar refactors amplios con fixes puntuales.
- Mantener nombres, rutas y patrones ya existentes en el proyecto.
- Si agregas automatizaciones/scripts, ubícalos en `node/` siguiendo el estilo actual.

## Checklist rápido antes de PR
- [ ] El cambio respeta tabs/BEM/convenciones JSON del proyecto.
- [ ] Se ejecutaron checks relevantes al área tocada.
- [ ] No se incluyó contenido homebrew por error.
- [ ] No se alteraron artefactos generados salvo que el cambio lo requiera explícitamente.
