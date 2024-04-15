# Stage 1: Build Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app  

# Copy package.json and package-lock.json
COPY package*.json ./
COPY entrypoint.sh ./

# Install npm dependencies
RUN npm install

# Copy all files
COPY . .

# Make scripts executable
RUN chmod +x entrypoint.sh

# Generate Prisma client and build the application
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build
ENV NODE_ENV=production
ENV NODE_ENV=production
RUN npm ci --only=production

# Stage 2: Production Stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy node_modules from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy package.json and package-lock.json
COPY --from=builder /usr/src/app/package*.json ./

# Copy entrypoint script
COPY --from=builder /usr/src/app/entrypoint.sh ./

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Set the entrypoint and default command
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
