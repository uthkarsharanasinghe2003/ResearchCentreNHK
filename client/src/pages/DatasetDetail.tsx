import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getDatasetById,
  SAMPLE_DATASETS,
  type DatasetDetail as IDatasetDetail,
  type BarChartDataPoint,
} from '../api/datasetApi';
import SummaryCard from '../components/SummaryCard';
import DatasetBarChart from '../components/DatasetBarChart';

export const DatasetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<IDatasetDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'preview'>('overview');

  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getDatasetById(id);
        if (data) {
          setDataset(data);
        } else {
          throw new Error('No data received for this dataset ID.');
        }
      } catch (err: any) {
        console.warn('API fetch failed, checking sample fallback:', err);
        // Fallback to sample dataset if id matches sample or for demonstration
        const sampleMatch = SAMPLE_DATASETS.find((s) => String(s.id) === String(id));
        if (sampleMatch) {
          setDataset(sampleMatch);
        } else {
          // If no specific match, allow defaulting to first sample if user wants
          setError(
            err.response?.data?.message ||
              err.message ||
              `Unable to load dataset with ID "${id}" from backend.`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to extract chart data for a given column name
  const getChartDataForColumn = (columnName: string): BarChartDataPoint[] => {
    if (!dataset?.chartData) return [];

    // If chartData is an object with column keys
    if (typeof dataset.chartData === 'object' && !Array.isArray(dataset.chartData)) {
      if (dataset.chartData[columnName]) {
        return dataset.chartData[columnName];
      }
    }

    // If chartData is already an array of data points
    if (Array.isArray(dataset.chartData)) {
      return dataset.chartData;
    }

    return [];
  };

  // Color palette for charts
  const chartColors = ['#2563eb', '#0d9488', '#7c3aed', '#ea580c', '#0284c7'];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading dataset analysis and statistics...</p>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div>
        <Link to="/" className="back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Datasets Dashboard
        </Link>

        <div className="alert alert-danger">
          <strong>Error Loading Dataset:</strong> {error || 'Dataset not found.'}
        </div>

        <div className="empty-state">
          <h3>Dataset Unavailable</h3>
          <p>
            The requested dataset could not be retrieved from the backend API. You can explore one of the sample research datasets below.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to={`/datasets/${SAMPLE_DATASETS[0].id}`} className="btn btn-primary">
              View Sample Dataset (NHK Survey 2025)
            </Link>
            <Link to="/" className="btn btn-secondary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <Link to="/" className="back-link">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Datasets Dashboard
      </Link>

      {/* Dataset Header Card */}
      <div className="detail-header-card">
        <div className="detail-title-row">
          <h1 className="detail-title">{dataset.name}</h1>
          <Link to="/upload" className="btn btn-outline btn-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Another
          </Link>
        </div>

        <div className="detail-badges">
          <span className="badge badge-blue">Excel (.xlsx)</span>
          {dataset.filename && (
            <span className="badge badge-gray">File: {dataset.filename}</span>
          )}
          <span className="badge badge-gray">
            Uploaded: {formatDate(dataset.uploadDate)}
          </span>
          {dataset.rowCount !== undefined && (
            <span className="badge badge-green">
              {dataset.rowCount.toLocaleString()} Rows
            </span>
          )}
          {dataset.summaryStats && (
            <span className="badge badge-gray">
              {dataset.summaryStats.length} Numeric Columns
            </span>
          )}
        </div>

        {/* Text Description / Summary Section */}
        <div className="detail-description-box">
          <strong>Description & Research Context:</strong>
          <p style={{ marginTop: '0.25rem' }}>
            {dataset.description ||
              'No supplementary description provided for this dataset. The summary statistics below are computed across all numeric observations.'}
          </p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Statistics & Charts
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`btn ${activeTab === 'charts' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Bar Charts Only
        </button>
        {dataset.previewRows && dataset.previewRows.length > 0 && (
          <button
            onClick={() => setActiveTab('preview')}
            className={`btn ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Raw Data Preview ({dataset.previewRows.length} rows)
          </button>
        )}
      </div>

      {/* a) Text Description & Summary Section: Mean, Min, Max, Count for each numeric column */}
      {(activeTab === 'overview') && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 className="section-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Numeric Columns Summary Statistics
          </h2>
          <p className="section-subtitle">
            Parametric summary statistics (Mean, Min, Max, Count) computed for each quantitative column.
          </p>

          {dataset.summaryStats && dataset.summaryStats.length > 0 ? (
            <div className="summary-cards-grid">
              {dataset.summaryStats.map((stat, idx) => (
                <SummaryCard key={stat.columnName || idx} stat={stat} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No numeric columns identified in this dataset to generate summary statistics.</p>
            </div>
          )}
        </section>
      )}

      {/* b) Bar Charts for key numeric columns using Recharts <BarChart> */}
      {(activeTab === 'overview' || activeTab === 'charts') && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 className="section-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 17v-4" />
              <path d="M12 17V7" />
              <path d="M17 17v-8" />
            </svg>
            Visual Distributions & Key Column Bar Charts
          </h2>
          <p className="section-subtitle">
            Visual frequency distributions and comparative values for key numeric variables using Recharts.
          </p>

          <div className="charts-section-grid">
            {dataset.summaryStats && dataset.summaryStats.length > 0 ? (
              dataset.summaryStats.map((stat, idx) => {
                const chartData = getChartDataForColumn(stat.columnName);
                const color = chartColors[idx % chartColors.length];

                return (
                  <DatasetBarChart
                    key={stat.columnName || idx}
                    title={`${stat.columnName} - Distribution`}
                    subtitle={`Sample size N = ${stat.count.toLocaleString()} | Mean = ${stat.mean.toFixed(
                      1
                    )}`}
                    data={
                      chartData.length > 0
                        ? chartData
                        : [
                            { name: 'Min', value: stat.min },
                            { name: 'Mean', value: Number(stat.mean.toFixed(2)) },
                            { name: 'Max', value: stat.max },
                          ]
                    }
                    barColor={color}
                  />
                );
              })
            ) : (
              <div className="empty-state">
                <p>No numeric chart distributions available.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Raw Data Preview Table (if available) */}
      {(activeTab === 'preview' || activeTab === 'overview') &&
        dataset.previewRows &&
        dataset.previewRows.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title">Sample Records Preview</h2>
            <p className="section-subtitle">
              First {dataset.previewRows.length} observations from the uploaded Excel dataset.
            </p>

            <div className="card" style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    {Object.keys(dataset.previewRows[0]).map((key) => (
                      <th
                        key={key}
                        style={{
                          padding: '0.75rem 1rem',
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.previewRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      {Object.values(row).map((val: any, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '0.65rem 1rem',
                            color: 'var(--color-text-main)',
                            fontFamily: typeof val === 'number' ? 'var(--font-mono)' : 'inherit',
                          }}
                        >
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
    </div>
  );
};

export default DatasetDetail;
