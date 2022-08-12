FROM node:16-alpine
ENV prod=true
WORKDIR /app2
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["node", "build"]