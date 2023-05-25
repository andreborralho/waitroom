FROM node:18-alpine

ENV NODE_VERSION 18.16.0
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ENV PORT=3000
RUN npm run build

EXPOSE 3000

CMD [ "node", "build/index.js" ]
