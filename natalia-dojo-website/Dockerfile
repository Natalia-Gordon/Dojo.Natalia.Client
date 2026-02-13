# Stage 1: Build Angular app with SSR
FROM node:20-alpine AS builder

ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME

COPY package.json package-lock.json ./

RUN npm ci

COPY . .
RUN rm -rf dist

RUN if [ ! -f "environments/environment.ts" ]; then \
      echo "ERROR: environments/environment.ts not found!" && exit 1; \
    fi

# Production build WITH SSR (outputs browser + server bundles)
RUN npm run build -- --configuration production

RUN if [ ! -d "dist/natalia-dojo-website/browser" ]; then \
      echo "ERROR: Browser build not found!" && ls -la dist/natalia-dojo-website/ && exit 1; \
    fi
RUN if [ ! -f "dist/natalia-dojo-website/server/server.mjs" ]; then \
      echo "ERROR: SSR server build not found!" && ls -la dist/natalia-dojo-website/server/ && exit 1; \
    fi

# Stage 2: Production runtime (SSR Node server)
FROM node:20-alpine

ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME

RUN apk add --no-cache dumb-init

# Copy full dist (browser + server) so the SSR server can serve static assets and render pages
COPY --from=builder $APP_HOME/dist/natalia-dojo-website ./dist/natalia-dojo-website

# Cloud Run / flexible port
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]

# Run the Angular SSR Node server (reads PORT from env)
CMD ["node", "dist/natalia-dojo-website/server/server.mjs"]
