FROM node:20.19.2-slim-bookworm

# Update system packages to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm ci --omit=dev # Use npm ci for clean installs and --omit=dev for production

# Copy project files
COPY . .

# Build the application (if applicable, remove if your app doesn't have a build step)
# This command is specific to your application's build process.
# For example, if you use TypeScript or a build tool like Webpack/Vite:
RUN npm run build

# Expose the port your app runs on
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]