FROM alpine:latest

# 경량화된 Chromium과 필수 라이브러리 설치
RUN apk add --no-cache \
    chromium \
    nodejs \
    npm \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wqy-zenhei

# puppeteer가 자체적으로 chromium 다운하는 거 정지
ENV PUPPETEER_SKIP_DOWNLOAD=true

# 환경 변수 설정 (포트)
ENV PORT=3000

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

# 디렉토리 권한 설정
RUN chmod -R 755 /app

# 서버 실행 (server.js가 서버 엔트리 파일이라고 가정)
CMD ["node", "server.js"]
