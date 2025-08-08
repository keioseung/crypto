# Railway 환경변수 설정 가이드

## 🚀 백엔드 환경변수 설정

Railway 백엔드 서비스에서 다음 환경변수들을 설정하세요:

### 필수 환경변수
```
PORT=6060
NODE_ENV=production
FRONTEND_URL=https://crypto-production-60f9.up.railway.app
```

### 서버 설정
```
LOG_LEVEL=info
CORS_ORIGIN=https://crypto-production-60f9.up.railway.app
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
BODY_PARSER_LIMIT=10mb
```

### Upbit API 설정
```
UPBIT_API_URL=https://api.upbit.com/v1
UPBIT_WS_URL=wss://api.upbit.com/websocket/v1
```

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### AI 모델 설정
```
AI_MODEL_UPDATE_INTERVAL=300000
AI_PREDICTION_INTERVAL=60000
```

### WebSocket 설정
```
WS_HEARTBEAT_INTERVAL=30000
WS_RECONNECT_INTERVAL=5000
```

### 모니터링
```
HEALTH_CHECK_INTERVAL=30000
UPTIME_MONITORING=true
```

---

## 🎨 프론트엔드 환경변수 설정

Railway 프론트엔드 서비스에서 다음 환경변수들을 설정하세요:

### 필수 환경변수
```
VITE_BACKEND_URL=https://crypto-production-6042.up.railway.app
VITE_WS_URL=wss://crypto-production-6042.up.railway.app
```

### 앱 설정
```
VITE_APP_NAME=CryptoAI
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

### API 설정
```
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
```

### WebSocket 설정
```
VITE_WS_RECONNECT_INTERVAL=5000
VITE_WS_HEARTBEAT_INTERVAL=30000
```

### UI 설정
```
VITE_THEME=dark
VITE_LANGUAGE=ko
VITE_TIMEZONE=Asia/Seoul
```

### 기능 플래그
```
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_AI_PREDICTIONS=true
VITE_ENABLE_TECHNICAL_ANALYSIS=true
VITE_ENABLE_BACKTESTING=true
```

### 성능 설정
```
VITE_CACHE_DURATION=300000
VITE_MAX_CHART_POINTS=1000
```

### 모니터링
```
VITE_ENABLE_ANALYTICS=false
VITE_ERROR_REPORTING=false
```

---

## 📋 Railway에서 환경변수 설정 방법

### 1. Railway 대시보드 접속
- [Railway Dashboard](https://railway.app/dashboard)에 로그인

### 2. 백엔드 서비스 선택
- `crypto-production-6042` 서비스 클릭
- **Variables** 탭 선택

### 3. 환경변수 추가
- **New Variable** 버튼 클릭
- 위의 백엔드 환경변수들을 하나씩 추가

### 4. 프론트엔드 서비스 선택
- `crypto-production-60f9` 서비스 클릭
- **Variables** 탭 선택

### 5. 환경변수 추가
- **New Variable** 버튼 클릭
- 위의 프론트엔드 환경변수들을 하나씩 추가

### 6. 배포 확인
- 환경변수 설정 후 자동으로 재배포됨
- **Deployments** 탭에서 배포 상태 확인

---

## 🔍 환경변수 설정 확인

### 백엔드 테스트
```bash
curl https://crypto-production-6042.up.railway.app/health
```

### 프론트엔드 테스트
- 브라우저에서 `https://crypto-production-60f9.up.railway.app` 접속

---

## ⚠️ 주의사항

1. **환경변수 이름 정확히 입력**: 대소문자 구분
2. **URL 끝에 슬래시(/) 제거**: 환경변수 값에 슬래시 포함하지 않기
3. **재배포 대기**: 환경변수 변경 후 재배포 완료까지 기다리기
4. **로그 확인**: Railway 로그에서 오류 메시지 확인

---

## 🆘 문제 해결

### 502 에러 발생 시
1. Railway 로그 확인
2. 환경변수 설정 재확인
3. 서비스 재시작

### CORS 에러 발생 시
1. `FRONTEND_URL` 환경변수 확인
2. 백엔드 CORS 설정 확인

### WebSocket 연결 실패 시
1. `VITE_WS_URL` 환경변수 확인
2. 백엔드 WebSocket 서버 상태 확인
