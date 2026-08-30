# Changelog - calisat-frontend

El formato de este archivo se basa en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adherido al [Versionamiento Semántico](https://semver.org/lang/es/).

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
- Reemplazado `npm install` por `npm ci --only=production` para builds reproducibles
- Agregado `npm cache clean --force` para reducir tamaño de imagen
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
- AuthConfig.js con variables de entorno via import.meta.env
- services/api.js como interceptor de token Bearer
- components/layout/Navbar.jsx con navegación y LoginButton
- pages/HomePage.jsx con hero y categorías
- Dockerfile base multi-stage (Node 20 + Nginx)
- nginx.conf con SPA routing

[1.1.0]: https://github.com/DavNat13/calisat-frontend/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/DavNat13/calisat-frontend/releases/tag/v1.0.0
