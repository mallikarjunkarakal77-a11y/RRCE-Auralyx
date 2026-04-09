import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface TokenComparisonChartProps {
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
}

export function TokenComparisonChart({ originalTokens, optimizedTokens, tokensSaved }: TokenComparisonChartProps) {
  const option = {
    title: {
      text: 'Token Comparison',
      left: 'center',
      textStyle: {
        color: 'hsl(var(--foreground))',
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Original Tokens', 'Optimized Tokens', 'Tokens Saved'],
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: 'hsl(var(--border))',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: 'hsl(var(--border))',
        },
      },
      splitLine: {
        lineStyle: {
          color: 'hsl(var(--border))',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Tokens',
        type: 'bar',
        data: [
          {
            value: originalTokens,
            itemStyle: { color: 'hsl(0, 85%, 60%)' }, // Red for original
          },
          {
            value: optimizedTokens,
            itemStyle: { color: 'hsl(142, 76%, 36%)' }, // Green for optimized
          },
          {
            value: tokensSaved,
            itemStyle: { color: 'hsl(221, 83%, 53%)' }, // Blue for saved
          },
        ],
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          color: 'hsl(var(--foreground))',
          fontSize: 12,
        },
      },
    ],
  };

  return (
    <div className="w-full h-64">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        theme="light"
      />
    </div>
  );
}