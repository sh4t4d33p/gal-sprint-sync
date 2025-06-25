# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Copy generated Prisma client to dist
RUN cp -r src/generated dist/generated

# Remove devDependencies for a smaller image
RUN npm prune --production

# Expose backend port (adjust if not 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"] 