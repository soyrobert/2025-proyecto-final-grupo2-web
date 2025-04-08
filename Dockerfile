FROM node:20-alpine AS builder

WORKDIR /app

ARG BUILD_ENV=production
# Nueva variable para la clave de encriptación
ARG ENCRYPTION_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Inyectar la configuración en index.html si ENCRYPTION_KEY está presente
RUN if [ -n "$ENCRYPTION_KEY" ]; then \
    # Crear el script de configuración con la clave de encriptación
    echo "window.APP_CONFIG = { encryptionKey: '$ENCRYPTION_KEY' };" > /app/src/assets/runtime-config.js && \
    # Modificar index.html para incluir el script
    sed -i 's|<script>|<script src="assets/runtime-config.js"></script>\n  <script>|' /app/src/index.html \
    ; fi

RUN npm run build -- --configuration=${BUILD_ENV}

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/ccp-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]