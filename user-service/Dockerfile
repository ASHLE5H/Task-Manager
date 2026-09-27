# base image ,provides Node.js 18 and the required Node environment
FROM node:20

# create app directory inside container
WORKDIR /app

# copy  package.json and package-lock.json into the container , This is done separately so Docker can cache npm install
COPY package*.json ./

# Install the project's dependencies inside the container
RUN npm install

# copy all the file present in current dir to  app
COPY . .

# port which application is running
EXPOSE 3001

# command to run thr project
CMD ["node" , "index.js"]

