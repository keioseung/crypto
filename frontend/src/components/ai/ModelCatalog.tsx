import React from 'react';

export type ModelInfo = {
  key: string;
  name: string;
  type: 'regression' | 'classification';
  description: string;
  pros: string[];
  cons: string[];
  recommended: string[];
};

const CATALOG: ModelInfo[] = [
  {
    key: 'sma', name: 'Simple Moving Average', type: 'regression',
    description: '최근 N개 가격 평균으로 미래를 단순 연장',
    pros: ['노이즈 완화', '안정적'],
    cons: ['반응 느림', '급격한 추세에 취약'],
    recommended: ['횡보장', '완만한 추세 유지 시']
  },
  {
    key: 'ema', name: 'Exponential Moving Average', type: 'regression',
    description: '최근 데이터에 더 큰 가중치',
    pros: ['추세 전환 빠른 감지'],
    cons: ['노이즈 영향 큼'],
    recommended: ['변동성 확대 구간', '추세 전환 확인']
  },
  {
    key: 'lr', name: 'Linear Regression', type: 'regression',
    description: '선형 추세선 기반 외삽',
    pros: ['간단/빠름'],
    cons: ['비선형 패턴 반영 어려움'],
    recommended: ['단기 추세 확인']
  },
  {
    key: 'momentum', name: 'Momentum', type: 'regression',
    description: '최근 기울기를 유지해 연장',
    pros: ['추세 강할 때 유리'],
    cons: ['반전 구간에서 오차'],
    recommended: ['강한 모멘텀, 돌파 시도']
  },
  {
    key: 'meanrev', name: 'Mean Reversion', type: 'regression',
    description: '평균 회귀 가정으로 점진 복귀',
    pros: ['과열/과매도 구간 반등 포착'],
    cons: ['추세장에서는 역효과'],
    recommended: ['과열/과매도, 박스권']
  },
  {
    key: 'ensemble', name: 'Ensemble', type: 'regression',
    description: '여러 모델 평균으로 안정성 향상',
    pros: ['편향 완화', '일관성'],
    cons: ['반응성 낮을 수 있음'],
    recommended: ['불확실 구간, 기본값']
  },
  {
    key: 'trend', name: 'Trend Classifier', type: 'classification',
    description: '최근 변화율로 상승/하락/중립 판정',
    pros: ['빠름/직관적'], cons: ['잡음 민감'],
    recommended: ['대략적 방향성 체크']
  },
  {
    key: 'rsi', name: 'RSI State', type: 'classification',
    description: '과매수/과매도/중립 상태 분류',
    pros: ['범용성'], cons: ['추세장 허위 신호'],
    recommended: ['되돌림 가능성 점검']
  },
  {
    key: 'vol', name: 'Volatility Regime', type: 'classification',
    description: '저/중/고 변동성 상태',
    pros: ['리스크 관리'], cons: ['가격 방향성 X'],
    recommended: ['포지션 사이징']
  }
];

const ModelCatalog: React.FC = () => {
  return (
    <div className="space-y-4 text-sm">
      {CATALOG.map(m => (
        <div key={m.key} className="glass-dark rounded-lg p-4 border border-dark-700">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">{m.name} <span className="text-xs text-dark-400">({m.type})</span></div>
            <div className="text-dark-300">key: {m.key}</div>
          </div>
          <div className="text-dark-300 mt-1">{m.description}</div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-white/80">Pros</div>
              <ul className="list-disc list-inside text-emerald-300">
                {m.pros.map((p,i)=><li key={i}>{p}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-white/80">Cons</div>
              <ul className="list-disc list-inside text-rose-300">
                {m.cons.map((p,i)=><li key={i}>{p}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-white/80">Recommended</div>
              <ul className="list-disc list-inside text-sky-300">
                {m.recommended.map((p,i)=><li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModelCatalog;
