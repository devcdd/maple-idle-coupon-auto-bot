#!/bin/bash

# 로컬 개발용 빌드 및 실행 스크립트

set -e

echo "🏠 로컬 개발 환경 빌드 및 실행 시작..."

# 환경변수 파일 존재 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다. env.example을 복사해서 설정해주세요."
    echo "   cp env.example .env"
    exit 1
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose --profile full down || true

# 이미지 빌드
echo "🔨 로컬용 이미지 빌드 중..."

# 클라이언트 빌드
echo "📱 클라이언트 빌드..."
docker build -f Dockerfile.client -t makis-client:local .

# 서버 빌드
echo "🖥️  서버 빌드..."
docker build -f Dockerfile.server -t makis-server:local .

# 컨테이너 실행
echo "🚀 로컬 환경 실행 중..."

# 클라이언트와 서버 함께 실행 (full profile)
echo "📱🖥️  통합 컨테이너 시작..."
docker-compose --profile full up -d

# 상태 확인
echo "📊 컨테이너 상태 확인..."
sleep 3

echo "✅ 로컬 개발 환경 실행 완료!"
echo ""
echo "🌐 접근 주소:"
echo "   📱 프론트엔드: http://localhost:4000"
echo "   🖥️  백엔드 API: http://localhost:4010"
echo "   📋 API 문서: http://localhost:4010/api"
echo ""
echo "🛠️  유용한 명령어:"
echo "   로그 확인: docker-compose -f client.docker-compose.yml logs -f"
echo "   정지: ./stop-local.sh"
echo "   재시작: ./restart-local.sh"
