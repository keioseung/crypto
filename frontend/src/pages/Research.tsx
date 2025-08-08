import React from 'react';

const Research: React.FC = () => {
  const url = import.meta.env.VITE_RESEARCH_URL as string | undefined;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Research Lab (Streamlit)</h2>
      {url ? (
        <div className="w-full h-[75vh] rounded-lg overflow-hidden border border-dark-800">
          <iframe title="Research" src={url} className="w-full h-full bg-white" />
        </div>
      ) : (
        <div className="glass-dark rounded-lg p-4 border border-dark-700 text-sm text-dark-300">
          <div className="text-white/90 mb-2">연구 탭 설정 안내</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Streamlit 앱(Add1)을 별도 프로젝트로 배포합니다. (예: Streamlit Cloud, Render, EC2)</li>
            <li>배포된 URL을 프로젝트 환경변수에 설정: <code className="px-1 bg-dark-800 rounded">VITE_RESEARCH_URL</code></li>
            <li>재배포 후 이 탭에서 임베드된 UI를 바로 사용할 수 있습니다.</li>
          </ol>
          <div className="mt-3">권장: HTTPS 주소 사용 및 CORS/iframe 허용 설정</div>
        </div>
      )}
    </div>
  );
};

export default Research;
