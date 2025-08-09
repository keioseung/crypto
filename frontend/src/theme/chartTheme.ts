import {
  Chart as ChartJS,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Defaults
} from 'chart.js';

ChartJS.register(Filler, Tooltip, Legend, CategoryScale, LinearScale, TimeScale, PointElement, LineElement);

export function applyChartTheme() {
  // Colors & fonts
  Defaults.color = '#cbd5e1';
  Defaults.font.family = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
  Defaults.font.size = 12;

  // Layout / legend
  Defaults.plugins.legend.position = 'bottom';
  Defaults.plugins.legend.labels = { color: '#cbd5e1', usePointStyle: true } as any;
  Defaults.plugins.tooltip = {
    enabled: true,
    backgroundColor: 'rgba(15,23,42,0.95)',
    titleColor: '#e2e8f0',
    bodyColor: '#cbd5e1',
    borderColor: '#334155',
    borderWidth: 1,
    padding: 10,
    displayColors: false,
    mode: 'index',
    intersect: false
  } as any;

  // Scales
  Defaults.scales = Defaults.scales || {};
  (Defaults.scales as any).x = {
    ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true },
    grid: { color: 'rgba(148,163,184,0.12)' }
  };
  (Defaults.scales as any).y = {
    ticks: { color: '#94a3b8' },
    grid: { color: 'rgba(148,163,184,0.12)' }
  };
}
