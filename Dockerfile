# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Stage 2: Build Go application
FROM golang:1.24-alpine AS backend-builder
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy built frontend assets
COPY --from=frontend-builder /app/web/dist ./web/dist
RUN CGO_ENABLED=0 GOOS=linux go build -o server cmd/server/main.go

# Stage 3: Final runtime image
FROM alpine:3.21
WORKDIR /app

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy the binary from builder
COPY --from=backend-builder /app/server ./server

# Copy database migrations and queries (embedded via go:embed)
# These are already embedded in the binary, but we include .env.example as reference
COPY .env.example .env.example

# Create directories for data persistence
RUN mkdir -p /app/uploads

# Set default environment variables
ENV PORT=:3000
ENV DATABASE_PATH=/app/data/dz.db
ENV MEDIA_STORAGE_PATH=/app/uploads

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Run the application
CMD ["./server"]
