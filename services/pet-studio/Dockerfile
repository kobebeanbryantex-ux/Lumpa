FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install --ignore-scripts=false
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S lumpa && adduser -S -G lumpa -u 10001 lumpa
COPY package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p /data/pet-studio && chown -R lumpa:lumpa /data
USER lumpa
EXPOSE 8090
CMD ["node", "dist/index.js"]
