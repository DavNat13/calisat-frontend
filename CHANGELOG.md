# Changelog - calisat-frontend

El formato de este archivo se basa en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adherido al [Versionamiento Semántico](https://semver.org/lang/es/).

## [1.6.1] - 2026-09-25

### Added
- `src/config/api.js` con la URL del API Gateway hardcodeada (única fuente de verdad; sin `.env` ni `import.meta.env`)
- `src/utils/errores.js` (mensajes de error genéricos en español para la UI, detalle solo en `console.error`) y `src/utils/enfocarContenido.js` (devolución de foco al contenido principal)

### Changed
- `AuthConfig.js`: constantes de tenant, client id y redirects visibles en el archivo, y obtención de la cuenta activa con `getActiveAccount()`
- `ProtectedRoute` movido de `src/components/auth/` a `src/auth/`

## [1.6.0] - 2026-09-25

### Added
- Dependencias `@fontsource-variable/inter` (tipografía autoalojada) y `lucide-react` (iconos del kit)
- Parciales de estilos en `src/styles/`: `tokens`, `fuentes`, `base`, `animaciones`, `sombras`, `bordes`, `tarjetas`, `iconos`, `inputs`, `botones` y `paginas`
- `src/App.css` con la base de la nueva paleta

### Changed
- `src/index.css` movido a `src/styles/index.css`; `main.jsx` carga las fuentes y los parciales
- Nueva paleta en `tokens.css` (`@theme`): amarillo `#FACC15`, neutros `#0A0A0A`/`#FAFAFA` y foco `#a16207` (contraste 4.92:1 sobre blanco); `src/styles/index.css` ya no lleva utilidades Tailwind

## [1.5.1] - 2026-09-25

### Fixed
- `nginx.conf` reescrito: cabeceras de seguridad declaradas únicamente a nivel `server` (evita perderlas por la herencia de `add_header`), CSP con `script-src 'self'`, HSTS, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`; `server_tokens off` y caché con `expires`
- `.gitignore` excluye `.env` y `.env.*` (la SPA no usa variables de entorno; la configuración va hardcodeada)
- `vite.config.js`: troceado de bundles `msal` y `vendor` en la salida del build
- Nuevo `.dockerignore` para builds Docker sin artefactos locales

## [1.5.0] - 2026-09-24

### Added
- `AuthRoleProvider`: contexto React bajo `MsalProvider` que lee `instance.getActiveAccount().idTokenClaims.roles` y expone `roles`, `activeRole`, `hasRole` y `hasAnyRole` (ADMINISTRADOR, CLIENTE, LOGISTICA)
- Componente `ProtectedRoute` que valida el rol activo y redirige a `/403` si no hay permisos (o a `/` si no hay sesión)
- Página `ForbiddenPage` en la ruta `/403`
- Renderizado condicional en `UserNavbar`: "Mi Perfil" solo para CLIENTE, "Crear Productos" solo para ADMINISTRADOR, indicador de rol activo en el menú
- Rutas `/carrito`, `/checkout` y `/perfil` protegidas con `ProtectedRoute` para CLIENTE; enlace "Carrito" del `Navbar` visible solo para CLIENTE
- Formulario y acciones de gestión de productos (`ProductoForm`, botones Editar/Eliminar) visibles solo para ADMINISTRADOR
- Manejo de HTTP 403 en `catalogoService` con mensaje "Se requiere rol administrador"
- Versión package.json actualizada a 1.5.0

## [1.4.0] - 2026-09-23

### Added
- Paleta completa de tokens de diseño en `@theme` de `src/index.css`: `primary`, `accent`, `background`, `surface` (2 y 3), `border` (y `strong`), `text` (muted y subtle), `success`, `warning`, `danger` (y `soft`) con sus variantes hover/active/soft

### Changed
- Componentes y estilos migrados a los nuevos tokens del tema: `Navbar`, `UserNavbar.css`, `UserProfile.css`, `ConfirmDialog`, `ProductoCard`, `ProductoForm`, `HomePage` y `ProductosPage`
- Colores hardcodeados (`#020617`, `#EA580C`, grises de Tailwind) reemplazados por variables del tema (`var(--color-*)` y utilidades `bg-*`/`text-*`/`border-*`)
- Eliminados estilos obsoletos `.token-value` de `UserProfile.css`

## [1.3.4] - 2026-09-23

### Fixed
- Corregidos 5 errores de ESLint: imports y parámetros `catch` sin usar en `useUserProfile`, regla `react-hooks/exhaustive-deps` en `useProductos`
- Carga de productos normalizada en `useProductos` (soporte de respuesta array y paginada `content`) con cancelación del efecto al desmontar
- `vite.config.js`: `base: '/'` para rutas SPA correctas al desplegar en la raíz

### Removed
- Bloque de visualización del token JWT en `UserProfile.jsx`
- Código muerto: `src/services/api.js`, `src/components/layout/LoginButton.jsx` y assets SVG (`react.svg`, `vite.svg`, `public/icons.svg`)

### Added
- `package-lock.json` para instalación reproducible de dependencias (`npm ci`)

## [1.3.3] - 2026-09-07

### Added
- Edición de productos: formulario pre-cargado con datos del producto seleccionado (PUT)
- Eliminación de productos con modal de confirmación previa (DELETE)
- Botones "Editar" y "Eliminar" en cada tarjeta de producto
- Filtro rápido por categoría con campo de búsqueda
- Contador de productos en el listado

### Changed
- Servicio catalogoService ampliado con `getProductoBySku`, `getProductosByCategoria`, `updateProducto`, `deleteProducto`
- Formulario dinámico: alterna entre modo creación y edición
- SKU deshabilitado durante edición para preservar inmutabilidad

## [1.3.2] - 2026-09-07

### Changed
- Formulario de creación de productos con diseño responsivo y estados de carga
- Grilla adaptativa de tarjetas de productos con imagen, precio formateado y categoría
- Manejo de errores y mensajes de éxito en el formulario

## [1.3.1] - 2026-09-07

### Added
- Enlace "Crear Productos" en el menú desplegable del navbar de usuario
- Navegación SPA hacia `/productos` desde el dropdown

## [1.3.0] - 2026-09-07

### Added
- Vista de gestión de catálogo (`ProductosPage.jsx`) con formulario y listado
- Servicio `catalogoService.js` para consumo del API Gateway (GET/POST)
- Ruta `/productos` configurada en App.jsx
- Listado de productos activos en grilla de tarjetas
- Formulario de creación con campos: SKU, Nombre, Descripción, Precio, Categoría, Imagen URL
- Actualización automática del listado tras crear un producto

### Changed
- Versión incrementada a 1.3.0

## [1.2.12] - 2026-09-05

### Added
- Visualización del token JWT en la sección de perfil
- Estilos CSS para el campo de token con efecto hover

## [1.2.11] - 2026-09-05

### Fixed
- Corregida ruta de importación de AuthConfig en hook useUserProfile

## [1.2.10] - 2026-09-05

### Fixed
- Corregida ruta `/perfil` para usar componente `UserProfile` real
- Reemplazado `<a href>` por `<Link to>` en UserNavbar para navegación SPA
- Cerrado menú desplegable al hacer clic en "Mi Perfil"

## [1.2.9] - 2026-09-05

### Changed
- Verificada integración completa de UserProfile con API Gateway
- Confirmado envío correcto de Bearer Token en GET, PUT y DELETE
- Optimizado manejo de estados de carga y mensajes de error

## [1.2.8] - 2026-09-05

### Changed
- Eliminadas variables de entorno del Dockerfile (ARG/ENV de Vite)
- Hardcodeadas credenciales de Azure AD y URL del API Gateway en código fuente
- Simplificado proceso de construcción Docker para entorno académico

## [1.2.7] - 2026-09-05

### Fixed
- Corregido uso de `loginRequest` por `apiRequest` en hook `useUserSync`
- Se evita solicitar scopes incorrectos de Microsoft Graph (`User.Read`)
- Peticiones de sincronización ahora obtienen audiencia correcta para API Gateway

## [1.2.6] - 2026-09-06

### Fixed
- Actualizada la adquisición de tokens MSAL para usar los scopes personalizados `apiRequest` (reemplazo de `loginRequest`) en el hook `useUserProfile`
- Resueltos errores 401 Unauthorized por discrepancias entre el emisor y la audiencia del token frente al autorizador JWT del API Gateway

## [1.2.5] - 2026-09-04

### Fixed
- Dockerfile actualizado: variable `VITE_MS_USUARIOS_URL` renombrada a `VITE_API_GATEWAY_URL`

## [1.2.4] - 2026-09-04

### Changed
- Reemplazada URL hardcoded del backend por variable `VITE_API_GATEWAY_URL`
- Hooks `useUserSync` y `useUserProfile` ahora leen la URL del backend desde la variable de entorno `VITE_API_GATEWAY_URL` (hoy ya no aplica: la URL está hardcodeada en `src/config/api.js`)
- Variable de entorno renombrada de `VITE_MS_USUARIOS_URL` a `VITE_API_GATEWAY_URL`

### Added
- Variable `VITE_API_GATEWAY_URL` para conexión centralizada al API Gateway

## [1.2.2] - 2026-09-04

### Added
- Componente `UserNavbar.jsx` con ícono de usuario y menú desplegable
- Estilos `UserNavbar.css` para navegación de usuario
- Componente `UserProfile.jsx` con botones para probar endpoints CRUD
- Estilos `UserProfile.css` para interfaz de perfil
- Hook `useUserProfile` para consumir GET, PUT, DELETE contra el backend

### Changed
- Navbar.jsx actualizado para usar `UserNavbar` en lugar de `LoginButton`

## [1.2.1] - 2026-09-04

### Added
- Hook personalizado `useUserSync` para sincronización automática con backend
- Extracción de lógica de registro desde LoginButton hacia hook reutilizable

### Changed
- LoginButton.jsx simplificado usando `useUserSync`

## [1.2.0] - 2026-09-04

### Added
- Integración de registro automático POST hacia el backend después del login
- Adquisición silenciosa de token con `acquireTokenSilent` antes de llamar al API
- Endpoint POST `/api/v1/usuarios/registro` con Bearer token en headers

### Fixed
- Prevención de bucles infinitos con `useRef` para ejecutar el POST una sola vez por sesión

## [1.1.2] - 2026-09-04

### Fixed
- Limpieza de parámetros `state=` y `code=` en URL post-login de Azure AD
- URL base limpia sin recargar la página después del redirect

## [1.1.1] - 2026-08-28

### Fixed
- Corregido comando de instalación en Dockerfile: reemplazado `npm ci --only=production` por `npm install`
- Solucionado error por ausencia de package-lock.json
- Vite ahora recibe todas las dependencias incluyendo devDependencies para compilar correctamente

## [1.1.0] - 2026-08-28

### Added
- Dockerfile multi-stage optimizado con ARG/ENV para variables VITE_*
- Variables de entorno: VITE_AZURE_CLIENT_ID, VITE_AZURE_TENANT_ID, VITE_AZURE_REDIRECT_URI, VITE_MS_USUARIOS_URL
- Health check en Dockerfile para monitoreo de contenedor
- Usuario no-root (calisat:calisat) en imagen de producción
- nginx.conf mejorado con compresión gzip
- Headers de seguridad: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy
- Caché optimizado para assets estáticos (1 año) e imágenes (30 días)
- Bloqueo de acceso a archivos ocultos (.)

### Changed
- Actualizada imagen Nginx a versión 1.25-alpine
- Eliminada configuración por defecto de Nginx

### Security
- Container ejecuta como usuario no-root
- Headers HTTP de seguridad habilitados
- Acceso a archivos ocultos bloqueado

## [1.0.0] - 2026-08-28

### Added
- Proyecto inicial calisat-frontend
- React 19.2.8 con Vite 8.2.2
- Tailwind CSS 4.1.0 con colores corporativos (#020617, #EA580C)
- React Router DOM 7.1.0 con 5 rutas configuradas
- Integración MSAL para autenticación Azure AD
- AuthConfig.js con configuración leída de variables de entorno de Vite (hoy ya no aplica: valores fijos en `src/auth/AuthConfig.js`)
- services/api.js como interceptor de token Bearer
- components/layout/Navbar.jsx con navegación y LoginButton
- pages/HomePage.jsx con hero y categorías
- Dockerfile base multi-stage (Node 20 + Nginx)
- nginx.conf con SPA routing

[1.5.0]: https://github.com/DavNat13/calisat-frontend/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/DavNat13/calisat-frontend/compare/v1.3.4...v1.4.0
[1.3.4]: https://github.com/DavNat13/calisat-frontend/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/DavNat13/calisat-frontend/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/DavNat13/calisat-frontend/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/DavNat13/calisat-frontend/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.12...v1.3.0
[1.2.12]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.11...v1.2.12
[1.2.11]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.10...v1.2.11
[1.2.10]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.9...v1.2.10
[1.2.9]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.8...v1.2.9
[1.2.8]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.2...v1.2.4
[1.2.2]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/DavNat13/calisat-frontend/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/DavNat13/calisat-frontend/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/DavNat13/calisat-frontend/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/DavNat13/calisat-frontend/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/DavNat13/calisat-frontend/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/DavNat13/calisat-frontend/releases/tag/v1.0.0
