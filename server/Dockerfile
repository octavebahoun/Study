FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN for i in 1 2 3 4 5; do \
    npm ci --only=production && break || \
    (echo "Retrying npm ci ($i)..." && sleep 10); \
    done
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
