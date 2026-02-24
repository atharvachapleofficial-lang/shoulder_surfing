FROM node:18-alpine
WORKDIR /app

# Copy package files first for faster install
COPY package.json package-lock.json* ./

RUN npm install --production

# Copy app source
COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
