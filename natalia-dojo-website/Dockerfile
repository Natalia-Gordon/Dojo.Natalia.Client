# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:alpine as builder

# Set the working directory
ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME

COPY package.json package-lock.json ./
EXPOSE 8080

# Install all the dependencies
RUN npm install -g @angular/cli
RUN npm install

#Copy other files and folder to working directory
COPY . .

# Generate the build of the application
RUN npm run build

CMD ["ng", "serve", "--host", "0.0.0.0"]
