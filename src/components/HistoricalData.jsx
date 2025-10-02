import { useState, useEffect } from 'react';
import { getStockData, getMockStockData } from '../services/stockApi';
import { format } from 'date-fns';
import './HistoricalData.css';

const HistoricalData = ({ symbol, useMock = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const rawData = useMock
          ? getMockStockData(symbol, '1M')
          : await getStockData(symbol, '1M');

        // Transform data for table
        const transformed = rawData.map(item => ({
          date: new Date(item.time * 1000),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          change: item.close - item.open,
          changePercent: ((item.close - item.open) / item.open) * 100
        }));

        setData(transformed);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, useMock]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '↕';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="historical-data loading">
        <div className="loading-spinner"></div>
        <p>Loading historical data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historical-data error">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="historical-data">
      <h2 className='symbol'>MINI (Historical) (Last 30 Days)</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>
                Date {getSortIcon('date')}
              </th>
              <th onClick={() => handleSort('open')}>
                Open {getSortIcon('open')}
              </th>
              <th onClick={() => handleSort('high')}>
                High {getSortIcon('high')}
              </th>
              <th onClick={() => handleSort('low')}>
                Low {getSortIcon('low')}
              </th>
              <th onClick={() => handleSort('close')}>
                Close {getSortIcon('close')}
              </th>
              <th onClick={() => handleSort('volume')}>
                Volume {getSortIcon('volume')}
              </th>
              <th onClick={() => handleSort('change')}>
                Change {getSortIcon('change')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const isPositive = row.change >= 0;
              const changeClass = isPositive ? 'positive' : 'negative';

              return (
                <tr key={index}>
                  <td className="date-cell">
                    {format(row.date, 'MMM dd, yyyy')}
                  </td>
                  <td>${row.open.toFixed(2)}</td>
                  <td>${row.high.toFixed(2)}</td>
                  <td>${row.low.toFixed(2)}</td>
                  <td className="close-cell">${row.close.toFixed(2)}</td>
                  <td>{row.volume.toLocaleString()}</td>
                  <td className={changeClass}>
                    <div className="change-cell">
                      <span>{isPositive ? '+' : ''}{row.change.toFixed(2)}</span>
                      <span className="change-percent">
                        ({isPositive ? '+' : ''}{row.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalData;
