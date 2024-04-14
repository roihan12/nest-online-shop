# stage 1
FROM node:18-alpine as devModules
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=development
COPY . .


# Stage 2
FROM node:18-alpine as productionBuild
WORKDIR /usr/src/app
COPY package*.json ./
COPY entrypoint.sh ./
COPY --from=devModules /usr/src/app/node_modules ./node_modules
COPY . .
RUN chmod +x /usr/src/app
RUN chmod +x /usr/src/app/entrypoint.sh
RUN npx prisma generate --schema=/usr/src/app/prisma/schema.prisma 
RUN npm run build
ENV NODE_ENV=production
RUN npm ci --only=production

# Stage 3
FROM node:18-alpine as production
COPY --from=productionBuild /usr/src/app/node_modules ./node_modules
COPY --from=productionBuild /usr/src/app/dist ./dist
ENTRYPOINT ["/usr/src/app/entrypoint.sh", "npm", "run", "start:prod"]  
CMD ["npm", "run", "start:prod"]