import React from 'react';

type InfoBannerProps = {
  title: string;
  steps: string[];
  tips?: string[];
};

const InfoBanner: React.FC<InfoBannerProps> = ({ title, steps, tips }) => {
  return (
    <div className="rounded-lg border border-dark-700 bg-dark-800 p-4 text-sm">
      <div className="text-white/90 font-semibold mb-2">{title}</div>
      <ol className="list-decimal list-inside space-y-1 text-dark-200">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {tips && tips.length > 0 && (
        <div className="mt-3">
          <div className="text-white/80 mb-1">Tips</div>
          <ul className="list-disc list-inside space-y-1 text-dark-300">
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InfoBanner;
