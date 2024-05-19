# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:20.11.0-alpine as builder

# Set the working directory
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

# Install all the dependencies
RUN npm install -g @angular/cli
RUN npm install -g npm@10.8.0
RUN npm install

# Add the source code to app
COPY . .

# Generate the build of the application
RUN npm run build --prod

CMD ["ng", "serve", "--host", "0.0.0.0"]