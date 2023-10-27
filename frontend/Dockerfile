FROM node:20-alpine

RUN mkdir /frontend
WORKDIR /frontend

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]