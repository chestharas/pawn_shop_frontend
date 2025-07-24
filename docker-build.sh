#!/bin/bash

# Docker build and push script for Pawn Shop Frontend (Optimized)
set -e

# Enable Docker BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Configuration - UPDATE THESE VALUES
DOCKER_HUB_USERNAME="your-dockerhub-username"  # Replace with your Docker Hub username
IMAGE_NAME="pawn-shop-frontend"
VERSION="latest"

echo "🚀 Building Pawn Shop Frontend Docker image with optimizations..."
echo "📦 Using BuildKit for faster builds"

# Clean up any previous build cache if needed
if [ "$1" = "clean" ]; then
    echo "🧹 Cleaning Docker build cache..."
    docker builder prune -f
    shift # Remove 'clean' from arguments
fi

# Build the Docker image with optimizations
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from ${IMAGE_NAME}:cache \
  --progress=plain \
  -t ${IMAGE_NAME}:${VERSION} \
  -t ${IMAGE_NAME}:cache \
  .

echo "✅ Docker image built successfully!"

# Tag for Docker Hub
DOCKER_HUB_IMAGE="${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${VERSION}"
docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_HUB_IMAGE}

# Also tag with version if provided
if [ ! -z "$1" ] && [ "$1" != "push" ]; then
    VERSION_TAG="${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:$1"
    docker tag ${IMAGE_NAME}:${VERSION} ${VERSION_TAG}
    echo "🏷️  Tagged image with version: $1"
fi

echo "🏷️  Tagged image for Docker Hub: ${DOCKER_HUB_IMAGE}"

# Show built images
echo "📦 Built images:"
docker images | grep ${IMAGE_NAME}

echo ""
echo "🚀 Ready to deploy! Use one of these commands:"
echo "  Development: docker-compose up -d"
echo "  Production:  docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "📤 To push to Docker Hub, run:"
echo "  ./docker-build.sh push"
echo "  or manually: docker push ${DOCKER_HUB_IMAGE}"
echo ""
echo "🧹 To clean build cache and rebuild: ./docker-build.sh clean"

# If 'push' argument is provided, push to Docker Hub
if [ "$1" = "push" ] || [ "$2" = "push" ]; then
    echo ""
    echo "📤 Pushing to Docker Hub..."
    docker push ${DOCKER_HUB_IMAGE}
    
    # Also push cache image for faster subsequent builds
    docker tag ${IMAGE_NAME}:cache ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:cache
    docker push ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:cache
    
    if [ ! -z "$1" ] && [ "$1" != "push" ]; then
        docker push ${VERSION_TAG}
    fi
    
    echo "✅ Successfully pushed to Docker Hub!"
    echo "🔗 Your image is available at: https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/${IMAGE_NAME}"
fi 