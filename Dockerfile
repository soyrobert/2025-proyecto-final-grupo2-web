FROM node:20-alpine AS builder

WORKDIR /app

ARG BUILD_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build -- --configuration=${BUILD_ENV}

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/ccp-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]