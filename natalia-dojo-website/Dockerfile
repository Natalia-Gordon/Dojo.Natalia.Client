# Stage 1: Compile and Build angular codebase
FROM node:20-alpine as builder

# Set the working directory
ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME

COPY package.json package-lock.json ./

# Install all the dependencies
RUN npm install -g npm@latest @angular/cli
RUN npm install

# Copy other files and folder to working directory
COPY . .

# Clean any existing build artifacts
RUN rm -rf dist

# Verify environment file before build
RUN cat environments/environment.ts

# Generate the build of the application (production configuration)
RUN npm run build -- --configuration production

# Stage 2: Production runtime
FROM node:20-alpine

ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder $APP_HOME/dist/natalia-dojo-website ./dist/natalia-dojo-website

# Expose the port (Cloud Run uses PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Run the SSR server
CMD ["node", "dist/natalia-dojo-website/server/server.mjs"]
