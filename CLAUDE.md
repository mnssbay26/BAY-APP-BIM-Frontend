🔒 Reglas de Seguridad del Repositorio
Estas reglas son ABSOLUTAS. No las violes bajo ninguna circunstancia.
❌ NO TOCAR — Archivos y carpetas protegidos

NUNCA modificar páginas existentes en src/pages/acc/ ni en src/pages/bim360/
NUNCA modificar src/services/acc.services.js excepto para AGREGAR funciones al final
NUNCA modificar src/services/bim360.services.js
NUNCA modificar archivos en src/lib/ (authorized.user.js, database.constants.js, default.row.js, general.functions.js, utils.js, viewer.actions.js)
NUNCA modificar archivos en src/components/, src/hooks/, src/assets/
NUNCA modificar App.css, package.json, package-lock.json
NUNCA eliminar ni renombrar archivos existentes
NUNCA instalar nuevas dependencias sin consultar primero

✅ SOLO CREAR o AGREGAR — Permitido
src/pages/acc/acc.assets.page.jsx          ← nueva página (CREAR)
src/pages/bim360/bim360.assets.page.jsx    ← nueva página para bim360 (CREAR)

src/services/acc.services.js               ← solo AGREGAR funciones al final
Y agregar las rutas correspondientes en el router de la app (solo al final o en el bloque de rutas ACC/BIM360 existente, sin tocar rutas ya declaradas).

🏗️ Arquitectura del Proyecto
Stack

Framework: React (JSX)
Routing: React Router (ver App.jsx o main.jsx para confirmar)
Charts: Verificar qué librería ya usa el proyecto (recharts, chart.js, apexcharts, etc.)
Tablas: Verificar componente de tabla existente (probablemente en src/components/)
Estilos: Verificar si usa CSS Modules, Tailwind, styled-components o CSS plain

Patrón de páginas existente
Cada página en src/pages/acc/ sigue este patrón general:

Imports de React hooks (useState, useEffect)
Import del servicio desde src/services/acc.services.js
Import de componentes compartidos (tabla, charts, layout)
Estado local para: data, loading, error, filters
useEffect que llama al servicio al montar
Render con: filtros arriba, charts en carrusel, tabla abajo

Patrón de servicios existente
acc.services.js exporta funciones que hacen fetch o axios al backend. Replicar exactamente ese patrón para las funciones de assets.