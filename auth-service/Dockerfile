# Start from a lightweight Node.js environment
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install nodemon globally for hot-reloading in dev
RUN npm install -g nodemon

# Copy your package files first (for caching efficiency)
COPY package*.json ./

# Install your dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

# Start your microservice
CMD ["npm", "run", "dev"]
