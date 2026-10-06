import React from 'react';
import type { DatasetSummaryStat } from '../api/datasetApi';

interface SummaryCardProps {
  stat: DatasetSummaryStat;
  unit?: string;
}

// Utility to format numbers cleanly
const formatNumber = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  // If integer
  if (Number.isInteger(val)) {
    return val.toLocaleString();
  }
  // If floating point, limit to 2 decimals
  return val.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

export const SummaryCard: React.FC<SummaryCardProps> = ({ stat, unit }) => {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <h4 className="summary-column-title" title={stat.columnName}>
          {stat.columnName}
        </h4>
        <span className="badge badge-blue">Numeric</span>
      </div>

      <div className="summary-stats-grid">
        <div className="summary-stat-box highlight">
          <div className="summary-stat-label">Mean (Avg)</div>
          <div className="summary-stat-value">
            {formatNumber(stat.mean)}
            {unit ? ` ${unit}` : ''}
          </div>
        </div>

        <div className="summary-stat-box">
          <div className="summary-stat-label">Count (N)</div>
          <div className="summary-stat-value">{formatNumber(stat.count)}</div>
        </div>

        <div className="summary-stat-box">
          <div className="summary-stat-label">Min</div>
          <div className="summary-stat-value">{formatNumber(stat.min)}</div>
        </div>

        <div className="summary-stat-box">
          <div className="summary-stat-label">Max</div>
          <div className="summary-stat-value">{formatNumber(stat.max)}</div>
        </div>
      </div>

      {(stat.median !== undefined || stat.stdDev !== undefined) && (
        <div className="summary-extra-stats">
          {stat.median !== undefined && (
            <span>
              <strong>Median:</strong> {formatNumber(stat.median)}
            </span>
          )}
          {stat.stdDev !== undefined && (
            <span>
              <strong>Std Dev:</strong> ±{formatNumber(stat.stdDev)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
