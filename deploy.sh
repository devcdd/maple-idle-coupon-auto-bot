#!/bin/bash

# 메키스 애플리케이션 배포 스크립트 (클라이언트 + 서버)

set -e

echo "🚀 메키스 애플리케이션 배포 시작 (클라이언트 + 서버)..."

# 환경변수 파일 존재 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다. env.example을 복사해서 설정해주세요."
    echo "   cp env.example .env"
    exit 1
fi

# 레지스트리 정보 확인
if ! grep -q "developercdd" docker-compose.yml; then
    echo "⚠️  docker-compose.yml에서 developercdd 레지스트리를 확인해주세요."
    exit 1
fi

# Docker 이미지 Pull
echo "📥 Docker 이미지 Pull 중..."
echo "   - 클라이언트 이미지 pull..."
docker pull developercdd/makis-client:latest
echo "   - 서버 이미지 pull..."
docker pull developercdd/makis-server:latest

# 기존 컨테이너 중지 및 제거
echo "🧹 기존 컨테이너 정리 중..."
docker-compose --profile full down || true

# 새 컨테이너 시작 (클라이언트 + 서버)
echo "🏃 새 컨테이너 시작 중..."
docker-compose --profile full up -d

# 상태 확인
echo "📊 컨테이너 상태 확인..."
sleep 5
docker-compose --profile full ps

# 헬스체크 (서버)
echo "💚 서버 헬스체크 수행 중..."
if docker-compose --profile full exec -T makis-server curl -f http://localhost:4010/health > /dev/null 2>&1; then
    echo "✅ 배포 완료! 애플리케이션이 정상 동작 중입니다."
    echo "   🌐 https://makis.cdd.co.kr (nginx를 통해 접근)"
    echo "   🔗 클라이언트: http://localhost:4000"
    echo "   🔗 서버: http://localhost:4010"
else
    echo "❌ 헬스체크 실패. 로그를 확인해주세요."
    echo "   docker-compose --profile full logs -f"
    exit 1
fi

echo ""
echo "📋 유용한 명령어들:"
echo "  docker-compose --profile full logs -f          # 실시간 로그"
echo "  docker-compose --profile full restart          # 재시작"
echo "  docker-compose --profile full down             # 중지"
