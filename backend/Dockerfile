# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Generate Prisma client (if using Prisma)
RUN npx prisma generate
RUN npm run build
RUN cp -r src/generated dist/generated

# Expose backend port (adjust if not 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"] 