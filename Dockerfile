FROM node:16-alpine
ENV prod=true
WORKDIR /app2
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "build"]