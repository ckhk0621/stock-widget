import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import './StockChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const PERIODS = ['10D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

const StockChart = ({ symbol, dailyData, loading = false }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [chartData, setChartData] = useState(null);
  const error = !dailyData && !loading ? 'No chart data available' : null;

  useEffect(() => {
    if (!dailyData || dailyData.length === 0) {
      return;
    }

    // Transform data for Chart.js
    const labels = dailyData.map(item => format(new Date(item.time * 1000), 'MM/dd'));
    const prices = dailyData.map(item => item.close);
    const volumes = dailyData.map(item => item.volume);

    // Determine trend color
    const isUpTrend = prices[prices.length - 1] > prices[0];
    const chartColor = isUpTrend ? '#22c55e' : '#ef4444';

    setChartData({
      labels,
      prices,
      volumes,
      chartColor,
      rawData: dailyData
    });
  }, [dailyData]);

  if (loading) {
    return (
      <div className="stock-chart loading">
        <div className="loading-spinner"></div>
        <p>Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-chart error">
        <p>Error loading chart: {error}</p>
      </div>
    );
  }

  if (!chartData) {
    return null;
  }

  const priceChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Price',
        data: chartData.prices,
        borderColor: chartData.chartColor,
        backgroundColor: `${chartData.chartColor}33`, // 20% opacity
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartData.chartColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const volumeChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Volume',
        data: chartData.volumes,
        backgroundColor: '#3b82f6aa',
        borderColor: '#3b82f6',
        borderWidth: 1
      }
    ]
  };

  const priceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#666',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const rawItem = chartData.rawData[dataIndex];
            return [
              `Price: $${rawItem.close.toFixed(2)}`,
              `High: $${rawItem.high.toFixed(2)}`,
              `Low: $${rawItem.low.toFixed(2)}`,
              `Volume: ${rawItem.volume.toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#e0e0e0'
        },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 20,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: '#e0e0e0'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          },
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const volumeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Volume: ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 20,
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: '#e0e0e0'
        },
        ticks: {
          callback: function(value) {
            return (value / 1000000).toFixed(1) + 'M';
          },
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <div className="stock-chart">
      <div className="chart-header">
        <h2 className='symbol'>{symbol} (STOCK CHART)</h2>
        <div className="period-selector">
          {PERIODS.map(period => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''} ${period !== '1M' ? 'disabled' : ''}`}
              onClick={() => period === '1M' && setSelectedPeriod(period)}
              disabled={period !== '1M'}
              title={period !== '1M' ? 'Only 1M period available to reduce API calls' : undefined}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container" style={{ height: '400px', marginBottom: '20px' }}>
        <Line data={priceChartData} options={priceChartOptions} />
      </div>

      <div className="volume-chart">
        <h4>Volume</h4>
        <div style={{ height: '100px' }}>
          <Bar data={volumeChartData} options={volumeChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default StockChart;
