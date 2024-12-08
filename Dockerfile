# Puppeteer의 공식 이미지 사용
FROM ghcr.io/puppeteer/puppeteer:latest

# 루트 권한으로 작업
USER root

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 파일을 복사
COPY package.json package-lock.json /app/

# 종속성 설치
RUN npm install

# 프로젝트 소스 코드 복사
COPY . /app/

# 디렉토리 상태 확인
RUN ls -l /app

# 디렉토리 권한 설정
RUN chmod -R 755 /app

# 서버 실행 (server.js가 서버 엔트리 파일이라고 가정)
CMD ["node", "server.js"]
