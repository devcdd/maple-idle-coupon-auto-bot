#!/bin/bash

# 로컬 개발 환경 재시작 스크립트

set -e

echo "🔄 로컬 개발 환경 재시작 중..."

# 기존 컨테이너 정지
echo "🛑 기존 컨테이너 정지..."
docker-compose --profile full down

# 새 이미지로 다시 빌드 (변경사항이 있다면)
echo "🔨 변경사항 확인 및 재빌드..."
if [ -f "packages/client/dist" ]; then
    echo "📱 클라이언트 재빌드..."
    docker build -f Dockerfile.client -t makis-client:local .
fi

echo "🖥️  서버 재빌드..."
docker build -f Dockerfile.server -t makis-server:local .

# 컨테이너 재시작
echo "🚀 컨테이너 재시작..."
docker-compose --profile full up -d

# 상태 확인
echo "📊 상태 확인..."
sleep 3

echo "✅ 로컬 개발 환경 재시작 완료!"
echo ""
echo "🌐 접근 주소:"
echo "   📱 프론트: http://localhost:4000"
echo "   🖥️  백엔드: http://localhost:4010"
