# Instruction to create the Docker Image
# alpine means add smaller version of the node image
FROM node:20-alpine

# please create the app directory/folder inside the container
WORKDIR /app

COPY ./package*.json ./

# Every Run command creates a layer
RUN npm install

# copy all files from current directory in the container app directory
COPY . .

WORKDIR /app/src

EXPOSE 3000

CMD [ "node", "app.js" ]
