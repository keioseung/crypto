# 🚀 CryptoAI - AI 기반 암호화폐 분석 플랫폼

업비트 API를 활용한 현대적인 암호화폐 분석 및 예측 플랫폼입니다. AI 모델을 통한 가격 예측, 기술적 분석, 백테스팅 기능을 제공합니다.

## ✨ 주요 기능

### 📊 실시간 데이터 분석
- 업비트 API 연동으로 실시간 시장 데이터 수집
- WebSocket을 통한 실시간 가격 업데이트
- 다중 마켓 동시 모니터링

### 🤖 AI 기반 예측
- LSTM, GRU, Transformer 등 다양한 AI 모델
- 앙상블 학습을 통한 정확도 향상
- 기술적 지표 기반 트렌드 분석
- 실시간 예측 결과 제공

### 📈 기술적 분석
- RSI, MACD, 볼린저 밴드 등 20+ 지표
- 차트 패턴 인식
- 지지/저항선 자동 계산
- 변동성 및 모멘텀 분석

### 🔬 백테스팅 시스템
- 다양한 거래 전략 백테스팅
- 포트폴리오 최적화
- 성과 지표 분석 (샤프 비율, 최대 낙폭 등)
- 전략 비교 분석

### 💼 포트폴리오 관리
- 실시간 포트폴리오 추적
- 리스크 관리 도구
- 자동 리밸런싱 알림
- 수익률 분석

## 🛠 기술 스택

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - RESTful API
- **Socket.io** - 실시간 통신
- **Chart.js** - 차트 라이브러리
- **Joi** - 데이터 검증
- **Winston** - 로깅

### Frontend
- **React 18** + **TypeScript**
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Query** - 상태 관리
- **Chart.js** + **React-Chartjs-2** - 차트
- **Framer Motion** - 애니메이션
- **React Router** - 라우팅

### AI/ML
- **TensorFlow.js** - 브라우저 기반 ML
- **Technical Indicators** - 기술적 지표
- **Ensemble Learning** - 앙상블 모델

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/crypto-ai-platform.git
cd crypto-ai-platform
```

### 2. 의존성 설치
```bash
# 루트 디렉토리에서
npm run install:all

# 또는 개별 설치
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. 환경 변수 설정
```bash
# backend/.env 파일 생성
cp backend/.env.example backend/.env

# 필요한 환경 변수 설정
UPBIT_API_URL=https://api.upbit.com/v1
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 4. 개발 서버 실행
```bash
# 루트 디렉토리에서 (백엔드 + 프론트엔드 동시 실행)
npm run dev

# 또는 개별 실행
npm run dev:backend  # 백엔드만
npm run dev:frontend # 프론트엔드만
```

### 5. 브라우저에서 확인
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5000
- API 문서: http://localhost:5000/api/v1/docs

## 📁 프로젝트 구조

```
crypto-ai-platform/
├── backend/                 # 백엔드 서버
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   ├── services/       # 비즈니스 로직
│   │   ├── middleware/     # 미들웨어
│   │   ├── utils/          # 유틸리티
│   │   └── cron.ts         # 스케줄링 작업
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 프론트엔드 앱
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── services/       # API 서비스
│   │   ├── utils/          # 유틸리티
│   │   └── types/          # TypeScript 타입
│   ├── package.json
│   └── vite.config.ts
├── package.json            # 워크스페이스 설정
└── README.md
```

## 🔧 API 엔드포인트

### 마켓 데이터
- `GET /api/v1/markets/supported` - 지원 마켓 목록
- `GET /api/v1/markets/tickers` - 현재가 조회
- `GET /api/v1/markets/candles/:market` - 캔들 데이터
- `GET /api/v1/markets/orderbook` - 호가 정보

### AI 예측
- `POST /api/v1/predictions/ensemble` - 앙상블 예측
- `POST /api/v1/predictions/single-model` - 단일 모델 예측
- `GET /api/v1/predictions/performance` - 모델 성능

### 기술적 분석
- `POST /api/v1/technical/indicators` - 기술적 지표
- `POST /api/v1/technical/patterns` - 패턴 분석
- `POST /api/v1/technical/support-resistance` - 지지/저항선

### 백테스팅
- `POST /api/v1/backtest/run` - 백테스팅 실행
- `POST /api/v1/backtest/compare` - 전략 비교
- `POST /api/v1/backtest/portfolio` - 포트폴리오 백테스팅

## 🌟 주요 컴포넌트

### Dashboard
- 실시간 시장 개요
- AI 예측 요약
- 포트폴리오 현황
- 알림 및 알림

### Markets
- 실시간 가격 차트
- 거래량 분석
- 마켓 비교
- 필터링 및 검색

### Predictions
- AI 모델 선택
- 예측 결과 시각화
- 신뢰도 분석
- 히스토리 추적

### Technical Analysis
- 다중 지표 차트
- 패턴 인식
- 신호 알림
- 커스텀 지표

### Backtesting
- 전략 백테스팅
- 성과 분석
- 리스크 관리
- 최적화 도구

## 🔒 보안

- Rate limiting 적용
- CORS 설정
- 입력 데이터 검증
- 에러 핸들링
- 로깅 및 모니터링

## 📊 성능 최적화

- React.lazy()를 통한 코드 스플리팅
- React Query를 통한 캐싱
- WebSocket을 통한 실시간 데이터
- 가상화를 통한 대용량 데이터 처리
- 이미지 최적화

## 🚀 배포

### Docker를 통한 배포
```bash
# Docker 이미지 빌드
docker build -t crypto-ai-platform .

# 컨테이너 실행
docker run -p 3000:3000 -p 5000:5000 crypto-ai-platform
```

### Vercel 배포 (프론트엔드)
```bash
cd frontend
vercel --prod
```

### Railway 배포 (백엔드)
```bash
cd backend
railway up
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

- 이슈 리포트: [GitHub Issues](https://github.com/your-username/crypto-ai-platform/issues)
- 이메일: support@cryptoai.com
- 문서: [Wiki](https://github.com/your-username/crypto-ai-platform/wiki)

## 🙏 감사의 말

- [Upbit API](https://docs.upbit.com/) - 암호화폐 데이터 제공
- [Chart.js](https://www.chartjs.org/) - 차트 라이브러리
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [React](https://reactjs.org/) - 프론트엔드 프레임워크

---

**⚠️ 투자 경고**: 이 플랫폼은 교육 및 연구 목적으로 제작되었습니다. 실제 투자 결정은 신중하게 하시기 바랍니다. 암호화폐 투자는 높은 위험을 수반합니다.
