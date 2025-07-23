#!/bin/bash

# Docker build script for Pawn Shop Frontend
set -e

echo "🐳 Building Pawn Shop Frontend Docker image..."

# Build the Docker image
docker build -t pawn-shop-frontend:latest .

echo "✅ Docker image built successfully!"

# Optional: Tag for production
docker tag pawn-shop-frontend:latest pawn-shop-frontend:prod

echo "🏷️  Tagged image for production"

# Show built images
echo "📦 Built images:"
docker images | grep pawn-shop-frontend

echo "🚀 Ready to deploy! Use one of these commands:"
echo "  Development: docker-compose up -d"
echo "  Production:  docker-compose -f docker-compose.prod.yml up -d" 