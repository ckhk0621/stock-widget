import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './HistoricalData.css';

const HistoricalData = ({ dailyData, loading = false }) => {
  // Component now receives pre-fetched data from parent (StockWidget)
  // This eliminates redundant API calls

  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const error = !dailyData && !loading ? 'No historical data available' : null;

  useEffect(() => {
    if (!dailyData || dailyData.length === 0) {
      return;
    }

    // Transform data for table
    const transformed = dailyData.map(item => ({
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
  }, [dailyData]);

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
      <h2 className='symbol'>MIMI (HISTORICAL) (Last 30 Days)</h2>

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
