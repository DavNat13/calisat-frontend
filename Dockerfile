# ==========================================
# ETAPA 1: Construcción (Builder)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Variables de entorno Vite (se inyectan en build time)
ARG VITE_AZURE_CLIENT_ID
ARG VITE_AZURE_TENANT_ID
ARG VITE_AZURE_REDIRECT_URI
ARG VITE_MS_USUARIOS_URL

ENV VITE_AZURE_CLIENT_ID=$VITE_AZURE_CLIENT_ID
ENV VITE_AZURE_TENANT_ID=$VITE_AZURE_TENANT_ID
ENV VITE_AZURE_REDIRECT_URI=$VITE_AZURE_REDIRECT_URI
ENV VITE_MS_USUARIOS_URL=$VITE_MS_USUARIOS_URL

# Copiamos dependencias primero para aprovechar caché
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copiamos código fuente
COPY . .

# Build de producción
RUN npm run build

# ==========================================
# ETAPA 2: Servidor de Producción (Nginx)
# ==========================================
FROM nginx:1.25-alpine

# Eliminar configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root para Nginx
RUN addgroup -g 1001 -S calisat && \
    adduser -S calisat -u 1001 -G calisat && \
    chown -R calisat:calisat /usr/share/nginx/html && \
    chown -R calisat:calisat /var/cache/nginx && \
    chown -R calisat:calisat /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R calisat:calisat /var/run/nginx.pid

USER calisat

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
