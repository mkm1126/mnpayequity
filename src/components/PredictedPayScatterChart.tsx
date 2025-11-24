import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { RegressionResult } from '../lib/predictedPayAnalysis';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type PredictedPayScatterChartProps = {
  maleJobs: { x: number; y: number }[];
  femaleJobs: { x: number; y: number }[];
  balancedJobs: { x: number; y: number }[];
  regressionLine: { x: number; y: number }[];
  lineExtension: { x: number; y: number }[];
  regression: RegressionResult;
};

export function PredictedPayScatterChart({
  maleJobs,
  femaleJobs,
  balancedJobs,
  regressionLine,
  lineExtension,
  regression,
}: PredictedPayScatterChartProps) {
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  const data = {
    datasets: [
      {
        label: 'Male Jobs',
        data: maleJobs,
        backgroundColor: '#1e40af',
        borderColor: '#1e40af',
        pointStyle: 'rect',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Female Jobs',
        data: femaleJobs,
        backgroundColor: '#f97316',
        borderColor: '#f97316',
        pointStyle: 'rect',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Balanced Jobs',
        data: balancedJobs,
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
        pointStyle: 'circle',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Predicted Pay',
        data: regressionLine,
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderWidth: 2,
        pointRadius: 0,
        showLine: true,
        type: 'line' as const,
      },
      {
        label: 'Line Continuation (Min)',
        data: [lineExtension[0], regressionLine[0]],
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true,
        type: 'line' as const,
      },
      {
        label: 'Line Continuation (Max)',
        data: [regressionLine[1], lineExtension[1]],
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true,
        type: 'line' as const,
      },
    ],
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Points',
          font: {
            size: 12,
            weight: 'normal',
          },
        },
        min: -340,
        max: 2720,
        ticks: {
          stepSize: 340,
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Salary',
          font: {
            size: 12,
            weight: 'normal',
          },
        },
        min: 0,
        max: 14000,
        ticks: {
          stepSize: 2000,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const x = context.parsed.x;
            const y = context.parsed.y;
            return `${label}: Points: ${x}, Salary: $${y.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
      <Scatter ref={chartRef} data={data} options={options} />
    </div>
  );
}

export function getChartImage(chartRef: React.RefObject<ChartJS<'scatter'>>): string | null {
  if (chartRef.current) {
    return chartRef.current.toBase64Image();
  }
  return null;
}
