# Use the official Node.js:lst runtime as a base image
FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Set an environment variable

# Expose the port that the app will run on
EXPOSE 3000

# Tell docker what command will start the application
CMD [ "npm", "start" ]