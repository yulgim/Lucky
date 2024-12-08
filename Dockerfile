# Puppeteer의 공식 이미지 사용
FROM ghcr.io/puppeteer/puppeteer:latest

# workspace 디렉터리 생성 및 이동
WORKDIR /app

# 프로젝트 소스 코드 복사
COPY . .

# 디렉토리 상태 확인
RUN ls -l /app


# 종속성 설치
RUN chmod -R 777 /app

# 서버 실행 (server.js가 서버 엔트리 파일이라고 가정)
CMD ["node", "server.js"]