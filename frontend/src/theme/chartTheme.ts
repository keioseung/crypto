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
} from 'chart.js';

ChartJS.register(Filler, Tooltip, Legend, CategoryScale, LinearScale, TimeScale, PointElement, LineElement);

export function applyChartTheme() {
  // Colors & fonts
  ChartJS.defaults.color = '#cbd5e1';
  ChartJS.defaults.font.family = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
  ChartJS.defaults.font.size = 12;

  // Layout / legend
  ChartJS.defaults.plugins.legend.position = 'bottom';
  ChartJS.defaults.plugins.legend.labels = { color: '#cbd5e1', usePointStyle: true } as any;
  ChartJS.defaults.plugins.tooltip = {
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
  (ChartJS.defaults.scales as any) = (ChartJS.defaults.scales as any) || {};
  (ChartJS.defaults.scales as any).x = {
    ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true },
    grid: { color: 'rgba(148,163,184,0.12)' }
  };
  (ChartJS.defaults.scales as any).y = {
    ticks: { color: '#94a3b8' },
    grid: { color: 'rgba(148,163,184,0.12)' }
  };
}
