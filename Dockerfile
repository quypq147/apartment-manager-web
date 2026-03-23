# Use the correct alpine tag (node:24 does not exist yet, using node:20 or node:22)
FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
# Include prisma to generate the client during build
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma Client (Required because your output is custom)
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Use 'start' for production instead of 'dev'
CMD ["npm", "run", "start"]