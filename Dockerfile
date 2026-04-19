FROM node:22.17.0

WORKDIR /career-bay-server

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]