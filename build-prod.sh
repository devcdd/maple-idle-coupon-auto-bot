#!/bin/bash

# 프로덕션용 빌드 및 푸시 스크립트

set -e

echo "🚀 프로덕션 빌드 및 배포 시작..."

# 환경변수 파일 존재 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다. env.example을 복사해서 설정해주세요."
    echo "   cp env.example .env"
    exit 1
fi

# 설정 변수들
TAG="${DOCKER_TAG:-latest}"
REGISTRY="${DOCKER_REGISTRY:-developercdd}"

echo "🏷️  태그: ${TAG}"
echo "🏢 레지스트리: ${REGISTRY}"

# Docker 데몬 실행 확인
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker 데몬이 실행되지 않았거나 권한이 없습니다."
    echo "   Docker Desktop을 실행하거나 Docker 서비스를 시작해주세요."
    exit 1
fi

# 이미지 빌드
echo "🔨 프로덕션 이미지 빌드 중..."

# 클라이언트 빌드
echo "📱 클라이언트 빌드..."

# 프로덕션용 환경변수 파일 생성
echo "VITE_KAKAO_APP_KEY=" > .env.production
echo "VITE_SERVER_URL=" >> .env.production

# Vite 빌드 실행
echo "   - Vite 빌드 실행..."
pnpm --filter makis-client build

# 임시 파일 정리
rm .env.production

# Docker 이미지 빌드
CLIENT_IMAGE="${REGISTRY}/makis-client:${TAG}"
docker build --platform linux/amd64 -f Dockerfile.client -t "${CLIENT_IMAGE}" .

# 서버 빌드
echo "🖥️  서버 빌드..."
SERVER_IMAGE="${REGISTRY}/makis-server:${TAG}"
docker build --platform linux/amd64 -f Dockerfile.server -t "${SERVER_IMAGE}" .

# Docker Hub 로그인 확인
echo "🔐 Docker 레지스트리 로그인 상태 확인..."
if ! docker system info >/dev/null 2>&1; then
    echo "⚠️  Docker 레지스트리에 로그인해야 합니다."
    echo "   다음 명령어로 로그인해주세요:"
    echo "   docker login ${REGISTRY}"
    exit 1
fi

# 이미지 푸시
echo "📤 프로덕션 이미지 푸시 중..."
echo "  📦 푸시: ${CLIENT_IMAGE}"
docker push "${CLIENT_IMAGE}"

echo "  📦 푸시: ${SERVER_IMAGE}"
docker push "${SERVER_IMAGE}"

echo "✅ 프로덕션 빌드 및 푸시 완료!"
echo ""
echo "🖼️  업로드된 이미지:"
echo "   📱 클라이언트: ${CLIENT_IMAGE}"
echo "   🖥️  서버: ${SERVER_IMAGE}"
echo ""
echo "📋 서버 배포 방법:"
echo "   1. 서버에서 프로젝트 클론"
echo "   2. cp env.example .env (환경변수 설정)"
echo "   3. docker-compose -f client.docker-compose.yml up -d"
echo "   4. docker-compose -f server.docker-compose.yml up -d"
echo ""
echo "💡 환경변수로 설정 변경:"
echo "   export DOCKER_REGISTRY='your-registry'"
echo "   export DOCKER_TAG='v1.0.0'"
