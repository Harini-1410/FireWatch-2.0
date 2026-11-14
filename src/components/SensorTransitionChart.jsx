import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useFireWatch } from '../context/FireWatchContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SensorTransitionChart({
  transitionData,
  isLoading,
  excludeTerra
}) {
  const { theme } = useFireWatch();
  const isLight = theme === 'light';

  // Custom Chart.js Plugin: Shaded Multi-Sensor Overlap Period (2012–2026)
  const overlapShadingPlugin = useMemo(() => ({
    id: 'overlapShadingClean',
    beforeDraw: (chart) => {
      const { ctx, chartArea, scales: { x } } = chart;
      if (!chartArea || !x) return;

      const labels = chart.data.labels || [];
      const startIndex = labels.findIndex(l => l.startsWith('2012') || l.startsWith('2015'));
      const endIndex = labels.length - 1;

      if (startIndex === -1 || startIndex >= endIndex) return;

      const startX = x.getPixelForTick(startIndex);
      const endX = x.getPixelForTick(endIndex);

      ctx.save();
      // Theme-coordinated overlap shading
      ctx.fillStyle = isLight ? 'rgba(215, 189, 176, 0.12)' : 'rgba(156, 161, 180, 0.06)';
      ctx.fillRect(startX, chartArea.top, endX - startX, chartArea.bottom - chartArea.top);

      // Dashed indicator line
      ctx.strokeStyle = isLight ? 'rgba(214, 204, 194, 0.8)' : 'rgba(156, 161, 180, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, chartArea.top);
      ctx.lineTo(startX, chartArea.bottom);
      ctx.stroke();

      ctx.restore();
    }
  }), [isLight]);

  const chartData = useMemo(() => {
    if (!transitionData || !transitionData.series || transitionData.series.length === 0) {
      return null;
    }

    const series = transitionData.series;
    const labels = series.map(d => d.date);
    const modisData = series.map(d => d.modis);
    const viirsData = series.map(d => d.viirs);
    const harmonizedData = series.map(d => d.harmonized);

    // Color definitions per theme
    const lfaiColor = isLight ? '#D7BDB0' : '#CDD09D';
    const lfaiFillTop = isLight ? 'rgba(215, 189, 176, 0.28)' : 'rgba(205, 208, 157, 0.22)';
    const lfaiFillBottom = isLight ? 'rgba(215, 189, 176, 0.0)' : 'rgba(205, 208, 157, 0.0)';
    const modisColor = isLight ? '#3E3E45' : '#9CA1B4';
    const viirsColor = isLight ? '#8C827A' : '#CBD0DC';

    const datasets = [
      {
        label: 'Harmonised LFAI',
        data: harmonizedData,
        borderColor: lfaiColor,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, lfaiFillTop);
          gradient.addColorStop(1, lfaiFillBottom);
          return gradient;
        },
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.35,
        cubicInterpolationMode: 'monotone',
        fill: true,
        order: 1
      },
      {
        label: 'Raw MODIS (1km)',
        data: modisData,
        borderColor: modisColor,
        backgroundColor: 'transparent',
        borderWidth: 2.2,
        borderDash: excludeTerra ? [5, 4] : [],
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.35,
        cubicInterpolationMode: 'monotone',
        order: 2
      },
      {
        label: 'Raw VIIRS (375m)',
        data: viirsData,
        borderColor: viirsColor,
        backgroundColor: 'transparent',
        borderWidth: 2.2,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.35,
        cubicInterpolationMode: 'monotone',
        order: 3
      }
    ];

    return { labels, datasets };
  }, [transitionData, excludeTerra, isLight]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350 },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: isLight ? '#232327' : '#9CA1B4',
          font: { family: 'Inter', size: 12 },
          boxWidth: 14,
          usePointStyle: true,
          pointStyle: 'line'
        }
      },
      tooltip: {
        backgroundColor: isLight ? '#EDEEE9' : 'rgba(20, 26, 36, 0.92)',
        titleColor: isLight ? '#0E0E10' : '#F0F1F3',
        bodyColor: isLight ? '#232327' : '#CBD0DC',
        borderColor: isLight ? '#D6CCC2' : 'rgba(156, 161, 180, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'JetBrains Mono', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            return ` ${context.dataset.label}: ${val !== null ? Math.round(val).toLocaleString() : 'N/A'}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isLight ? 'rgba(214, 204, 194, 0.45)' : 'rgba(156, 161, 180, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: isLight ? '#3E3E45' : '#9CA1B4',
          font: { family: 'JetBrains Mono', size: 11 },
          maxTicksLimit: 14,
          autoSkip: true,
        }
      },
      y: {
        grid: {
          color: isLight ? 'rgba(214, 204, 194, 0.45)' : 'rgba(156, 161, 180, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: isLight ? '#3E3E45' : '#9CA1B4',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value) => Number(value).toLocaleString()
        }
      }
    }
  }), [isLight]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--brand-highlight)] animate-spin mb-3" />
        <span className="text-xs font-mono text-[var(--text-muted)]">Cross-Calibrating Observation Effort...</span>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center">
        <span className="text-xs font-mono text-[var(--text-dim)]">No multi-sensor telemetry loaded</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Line
        data={chartData}
        options={options}
        plugins={[overlapShadingPlugin]}
      />
    </div>
  );
}
