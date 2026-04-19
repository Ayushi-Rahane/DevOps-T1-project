FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Expose the standard Vite port
EXPOSE 5173
# Start Vite and force it to broadcast to your localhost network via --host
CMD ["npm", "run", "dev", "--", "--host"]
