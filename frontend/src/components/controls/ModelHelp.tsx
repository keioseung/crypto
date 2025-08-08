import React from 'react';

const ModelHelp: React.FC = () => {
  return (
    <div className="text-xs text-dark-300 space-y-1">
      <div><span className="text-white/80 font-medium">SMA</span>: 단기 변동을 완화한 평균선. 횡보/완만한 추세에 적합.</div>
      <div><span className="text-white/80 font-medium">EMA</span>: 최근 데이터에 가중. 추세 전환에 민감.</div>
      <div><span className="text-white/80 font-medium">Ensemble</span>: 여러 모델 결합으로 안정성 향상.</div>
      <div>권장: 급등락 구간은 EMA, 안정 구간은 SMA, 불확실 구간은 Ensemble.</div>
    </div>
  );
};

export default ModelHelp;
