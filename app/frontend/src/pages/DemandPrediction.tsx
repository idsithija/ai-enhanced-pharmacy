import { useState, useEffect } from 'react';
import { demandPredictionService } from '../services/demandPredictionService';
import type { DemandSummary, PredictionResult } from '../services/demandPredictionService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <div className="pt-6">{children}</div>}
    </div>
  );
}

export const DemandPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DemandSummary | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await demandPredictionService.getAllPredictions();
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch demand predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return <span className="text-green-600" title="Increasing">📈</span>;
      case 'decreasing':
        return <span className="text-red-600" title="Decreasing">📉</span>;
      default:
        return <span className="text-blue-600" title="Stable">➡️</span>;
    }
  };

  const getPriorityChip = (daysUntilStockout: number) => {
    if (daysUntilStockout < 7) {
      return <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Critical</span>;
    } else if (daysUntilStockout < 14) {
      return <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">High</span>;
    } else if (daysUntilStockout < 30) {
      return <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Medium</span>;
    } else {
      return <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Low</span>;
    }
  };

  const renderPredictionTable = (predictions: PredictionResult[]) => {
    if (predictions.length === 0) {
      return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
          <p className="text-sm text-blue-800">No items in this category</p>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine Name</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Current Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Avg Daily Sales</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">7-Day Demand</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">30-Day Demand</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Days Until Stockout</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Trend</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Priority</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Reorder Qty</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {predictions.map((prediction) => (
                <tr key={prediction.medicineId} className="hover:bg-blue-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{prediction.medicineName}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">{prediction.currentStock}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">{prediction.averageDailySales}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-dark rounded-full">
                      {prediction.predictedDemand}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {prediction.predictedDemand30Days}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {prediction.daysUntilStockout > 999 ? '∞' : `${prediction.daysUntilStockout} days`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-2xl">
                    {getTrendIcon(prediction.trend)}
                  </td>
                  <td className="px-4 py-3 text-center">{getPriorityChip(prediction.daysUntilStockout)}</td>
                  <td className="px-4 py-3 text-center">
                    <p className="text-sm font-bold text-primary">{prediction.recommendedReorderQuantity}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{prediction.confidence}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const tabs = [
    { label: 'Critical Stock', icon: '⚠️' },
    { label: 'High Demand', icon: '📈' },
    { label: 'Slow Moving', icon: '📉' },
    { label: 'All Predictions', icon: '📦' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Demand Prediction Dashboard</h1>
          <p className="text-sm text-gray-600">
            AI-powered inventory forecasting based on 6 months of sales data
          </p>
        </div>
        <button
          onClick={fetchPredictions}
          className="p-3 text-primary hover:bg-blue-50 rounded-lg transition-colors"
          title="Refresh Predictions"
        >
          🔄
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-600 to-pink-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">⚠️</span>
            <div>
              <p className="text-4xl font-bold">{summary.criticalStockItems.length}</p>
              <p className="text-sm">Critical Stock Items</p>
              <p className="text-xs opacity-90">&lt;7 days until stockout</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-lime-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">📈</span>
            <div>
              <p className="text-4xl font-bold">{summary.highDemandItems.length}</p>
              <p className="text-sm">High Demand Items</p>
              <p className="text-xs opacity-90">Increasing trend</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-amber-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">📉</span>
            <div>
              <p className="text-4xl font-bold">{summary.slowMovingItems.length}</p>
              <p className="text-sm">Slow Moving Items</p>
              <p className="text-xs opacity-90">Low sales velocity</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">📦</span>
            <div>
              <p className="text-4xl font-bold">{summary.predictions.length}</p>
              <p className="text-sm">Total Medicines</p>
              <p className="text-xs opacity-90">AI predictions available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Different Views */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setTabValue(index)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  tabValue === index
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <TabPanel value={tabValue} index={0}>
            {summary.criticalStockItems.length > 0 ? (
              <>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-start gap-3">
                  <span className="text-red-600 text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-red-900">Urgent Action Required!</p>
                    <p className="text-sm text-red-800">
                      These items will run out of stock within 7 days. Place orders immediately to avoid stockouts.
                    </p>
                  </div>
                </div>
                {renderPredictionTable(summary.criticalStockItems)}
              </>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <span className="text-green-600 text-2xl">✅</span>
                <p className="text-sm text-green-800">
                  Great! No critical stock items at this time. All medicines have adequate inventory levels.
                </p>
              </div>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-start gap-3">
              <span className="text-blue-600 text-2xl">ℹ️</span>
              <p className="text-sm text-blue-800">
                These medicines show increasing demand trends. Consider increasing stock levels to meet growing demand.
              </p>
            </div>
            {renderPredictionTable(summary.highDemandItems)}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 flex items-start gap-3">
              <span className="text-yellow-600 text-2xl">ℹ️</span>
              <p className="text-sm text-yellow-800">
                These items have low sales velocity and high inventory. Consider promotions or reducing future orders.
              </p>
            </div>
            {renderPredictionTable(summary.slowMovingItems)}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {renderPredictionTable(summary.predictions)}
          </TabPanel>
        </div>
      </div>

      {/* Model Info Footer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <span className="text-blue-600 text-2xl">ℹ️</span>
        <p className="text-sm text-blue-800">
          <strong>Prediction Model:</strong> Statistical forecasting using moving averages (7-day, 30-day, 90-day weighted),
          trend detection, and seasonality analysis. Based on 6 months of synthetic sales data.{' '}
          <em>Can be upgraded to TensorFlow.js model for improved accuracy.</em>
        </p>
      </div>
    </div>
  );
};
