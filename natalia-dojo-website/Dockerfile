# Stage 1: Compile and Build angular codebase
FROM node:20-alpine as builder

# Set the working directory
ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm install -g npm@latest @angular/cli@^18.2.21
RUN npm ci

# Copy source code and configuration files
COPY . .

# Clean any existing build artifacts
RUN rm -rf dist

# Verify environment file exists before build
RUN if [ ! -f "environments/environment.ts" ]; then \
      echo "ERROR: environments/environment.ts not found!" && exit 1; \
    fi

# Generate the build of the application (production configuration with SSR)
RUN npm run build -- --configuration production

# Verify the build output
RUN if [ ! -f "dist/natalia-dojo-website/server/server.mjs" ]; then \
      echo "ERROR: Server build output not found!" && \
      ls -la dist/natalia-dojo-website/ && exit 1; \
    fi

# Stage 2: Production runtime
FROM node:20-alpine

ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies (needed for SSR server runtime)
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder $APP_HOME/dist/natalia-dojo-website ./dist/natalia-dojo-website

# Verify server file exists
RUN if [ ! -f "dist/natalia-dojo-website/server/server.mjs" ]; then \
      echo "ERROR: Server file not found in final image!" && exit 1; \
    fi

# Expose the port (Cloud Run uses PORT environment variable)
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the SSR server
CMD ["node", "dist/natalia-dojo-website/server/server.mjs"]
