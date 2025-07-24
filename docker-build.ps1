# Docker build and push script for Pawn Shop Frontend (Windows PowerShell)
param(
    [string]$Action = "",
    [string]$Version = ""
)

# Configuration - UPDATE THESE VALUES
$DOCKER_HUB_USERNAME = "your-dockerhub-username"  # Replace with your Docker Hub username
$IMAGE_NAME = "pawn-shop-frontend"
$VERSION_TAG = "latest"

# Enable Docker BuildKit for faster builds
$env:DOCKER_BUILDKIT = 1

Write-Host "🚀 Building Pawn Shop Frontend Docker image with optimizations..." -ForegroundColor Green
Write-Host "📦 Using BuildKit for faster builds" -ForegroundColor Blue

# Clean up any previous build cache if needed
if ($Action -eq "clean") {
    Write-Host "🧹 Cleaning Docker build cache..." -ForegroundColor Yellow
    docker builder prune -f
}

# Build the Docker image with optimizations
Write-Host "🔨 Building Docker image..." -ForegroundColor Cyan
docker build `
    --build-arg BUILDKIT_INLINE_CACHE=1 `
    --cache-from "${IMAGE_NAME}:cache" `
    --progress=plain `
    -t "${IMAGE_NAME}:${VERSION_TAG}" `
    -t "${IMAGE_NAME}:cache" `
    .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Tag for Docker Hub
$DOCKER_HUB_IMAGE = "${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${VERSION_TAG}"
docker tag "${IMAGE_NAME}:${VERSION_TAG}" $DOCKER_HUB_IMAGE

# Also tag with version if provided
if ($Version -and $Version -ne "push") {
    $VERSION_IMAGE = "${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${Version}"
    docker tag "${IMAGE_NAME}:${VERSION_TAG}" $VERSION_IMAGE
    Write-Host "🏷️  Tagged image with version: $Version" -ForegroundColor Yellow
}

Write-Host "🏷️  Tagged image for Docker Hub: $DOCKER_HUB_IMAGE" -ForegroundColor Yellow

# Show built images
Write-Host "`n📦 Built images:" -ForegroundColor Cyan
docker images | Where-Object { $_ -match $IMAGE_NAME }

Write-Host "`n🚀 Ready to deploy! Use one of these commands:" -ForegroundColor Green
Write-Host "  Development: docker-compose up -d" -ForegroundColor White
Write-Host "  Production:  docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White
Write-Host "`n📤 To push to Docker Hub, run:" -ForegroundColor Blue
Write-Host "  .\docker-build.ps1 push" -ForegroundColor White
Write-Host "  or manually: docker push $DOCKER_HUB_IMAGE" -ForegroundColor White
Write-Host "`n🧹 To clean build cache and rebuild: .\docker-build.ps1 clean" -ForegroundColor Yellow

# If 'push' argument is provided, push to Docker Hub
if ($Action -eq "push" -or $Version -eq "push") {
    Write-Host "`n📤 Pushing to Docker Hub..." -ForegroundColor Blue
    
    docker push $DOCKER_HUB_IMAGE
    
    # Also push cache image for faster subsequent builds
    docker tag "${IMAGE_NAME}:cache" "${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:cache"
    docker push "${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:cache"
    
    if ($Version -and $Version -ne "push") {
        docker push $VERSION_IMAGE
    }
    
    Write-Host "✅ Successfully pushed to Docker Hub!" -ForegroundColor Green
    Write-Host "🔗 Your image is available at: https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/${IMAGE_NAME}" -ForegroundColor Cyan
} 