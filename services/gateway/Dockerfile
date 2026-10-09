FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts=false && cp -R node_modules /prod_node_modules

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm install --ignore-scripts=false
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S lumpa && adduser -S -G lumpa -u 10001 lumpa
COPY --from=dependencies /prod_node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./package.json
USER lumpa
EXPOSE 8080
CMD ["node", "dist/index.js"]
