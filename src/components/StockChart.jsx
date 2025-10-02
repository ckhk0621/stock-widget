import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getStockData, getMockStockData } from '../services/stockApi';
import { format } from 'date-fns';
import './StockChart.css';

const PERIODS = ['10D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

const StockChart = ({ symbol, useMock = false }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = useMock
          ? getMockStockData(symbol, selectedPeriod)
          : await getStockData(symbol, selectedPeriod);

        // Transform data for recharts
        const transformed = data.map(item => ({
          date: item.time * 1000,
          price: item.close,
          volume: item.volume,
          high: item.high,
          low: item.low,
          open: item.open
        }));

        setChartData(transformed);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, selectedPeriod, useMock]);

  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);

    if (selectedPeriod === '10D') {
      return format(date, 'HH:mm');
    } else if (selectedPeriod === '1M' || selectedPeriod === '3M') {
      return format(date, 'MM/dd');
    } else {
      return format(date, 'MMM yy');
    }
  };

  const formatTooltipDate = (timestamp) => {
    const date = new Date(timestamp);

    if (selectedPeriod === '10D') {
      return format(date, 'MMM dd, HH:mm');
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{formatTooltipDate(data.date)}</p>
          <p className="tooltip-price">Price: ${data.price.toFixed(2)}</p>
          <p className="tooltip-volume">Volume: {data.volume.toLocaleString()}</p>
          {data.high && <p className="tooltip-detail">High: ${data.high.toFixed(2)}</p>}
          {data.low && <p className="tooltip-detail">Low: ${data.low.toFixed(2)}</p>}
        </div>
      );
    }
    return null;
  };

  // Determine if price is trending up or down
  const isUpTrend = chartData.length > 0
    ? chartData[chartData.length - 1].price > chartData[0].price
    : true;

  const chartColor = isUpTrend ? '#22c55e' : '#ef4444';

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

  return (
    <div className="stock-chart">
      <div className="chart-header">
        <h2 className='symbol'>MIMI (STOCK CHART)</h2>
        <div className="period-selector">
          {PERIODS.map(period => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              stroke="#666"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="volume-chart">
        <h4>Volume</h4>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#666"
              style={{ fontSize: '10px' }}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: '10px' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              labelFormatter={formatTooltipDate}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#3b82f6"
              strokeWidth={1}
              fill="url(#colorVolume)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
