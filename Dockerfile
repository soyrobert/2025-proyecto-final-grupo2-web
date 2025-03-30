FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/ccp-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]