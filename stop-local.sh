#!/bin/bash

# 로컬 개발 환경 정지 스크립트

set -e

echo "🛑 로컬 개발 환경 정지 중..."

# 컨테이너 정지 및 제거
echo "📱🖥️  통합 컨테이너 정지..."
docker-compose --profile full down

# 로컬 이미지 정리 (선택사항)
read -p "로컬 이미지도 정리하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 로컬 이미지 정리 중..."
    docker rmi makis-client:local makis-server:local 2>/dev/null || true
    echo "✅ 로컬 이미지 정리 완료"
fi

echo "✅ 로컬 개발 환경 정지 완료!"
