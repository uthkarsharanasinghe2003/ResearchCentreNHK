import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDatasets,
  SAMPLE_DATASETS,
  type DatasetListItem,
} from '../api/datasetApi';

export const Dashboard: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [usingSampleData, setUsingSampleData] = useState<boolean>(false);

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDatasets();
      if (Array.isArray(data) && data.length > 0) {
        setDatasets(data);
        setUsingSampleData(false);
      } else {
        // If API returns an empty array, set datasets to empty
        setDatasets(data || []);
      }
    } catch (err: any) {
      console.warn('API connection failed or endpoint not available yet:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to connect to the backend API at /api/v1/datasets.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUseSampleData = () => {
    setDatasets(
      SAMPLE_DATASETS.map((d) => ({
        id: d.id,
        name: d.name,
        filename: d.filename,
        uploadDate: d.uploadDate,
        description: d.description,
        rowCount: d.rowCount,
        columnCount: d.columnCount,
      }))
    );
    setUsingSampleData(true);
    setError(null);
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const q = searchQuery.toLowerCase();
    return (
      dataset.name.toLowerCase().includes(q) ||
      (dataset.description && dataset.description.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalDatasets = datasets.length;
  const totalRows = datasets.reduce((acc, curr) => acc + (curr.rowCount || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Research Datasets</h1>
          <p className="page-subtitle">
            Manage, analyze, and inspect statistical summaries of uploaded secondary research data.
          </p>
        </div>
        <div>
          <Link to="/upload" className="btn btn-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Upload New Dataset (.xlsx)
          </Link>
        </div>
      </div>

      {/* Backend Status or Notice */}
      {error && (
        <div className="alert alert-warning">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ flex: 1 }}>
            <strong>Backend Connection Notice:</strong> {error}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={fetchDatasets} className="btn btn-sm btn-secondary">
                Retry API Call
              </button>
              <button onClick={handleUseSampleData} className="btn btn-sm btn-outline">
                Load Sample Datasets (Demo Mode)
              </button>
            </div>
          </div>
        </div>
      )}

      {usingSampleData && (
        <div className="alert alert-info">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Displaying sample research data for frontend demonstration. You can test live backend sync at any time via "Retry".
          </span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="dashboard-overview-grid">
        <div className="overview-metric-card">
          <div className="overview-icon-wrapper">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="overview-metric-info">
            <span className="overview-metric-label">Total Datasets</span>
            <span className="overview-metric-val">{totalDatasets}</span>
          </div>
        </div>

        <div className="overview-metric-card">
          <div className="overview-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <div className="overview-metric-info">
            <span className="overview-metric-label">Analyzed Records</span>
            <span className="overview-metric-val">
              {totalRows > 0 ? totalRows.toLocaleString() : '--'}
            </span>
          </div>
        </div>

        <div className="overview-metric-card">
          <div className="overview-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="overview-metric-info">
            <span className="overview-metric-label">File Support</span>
            <span className="overview-metric-val">Excel (.xlsx)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="dashboard-controls">
        <div className="search-input-wrapper">
          <span className="search-icon">
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search datasets by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Fetching datasets from backend...</p>
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3>No Datasets Found</h3>
          <p>
            {searchQuery
              ? `No datasets matched "${searchQuery}". Try a different keyword.`
              : 'No research datasets have been uploaded yet. Upload an Excel (.xlsx) file to generate summary statistics and charts.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/upload" className="btn btn-primary">
              Upload Dataset
            </Link>
            {!usingSampleData && (
              <button onClick={handleUseSampleData} className="btn btn-secondary">
                View Sample Data
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="datasets-grid">
          {filteredDatasets.map((dataset) => (
            <div key={dataset.id} className="dataset-card">
              <div className="dataset-card-header">
                <h3 className="dataset-card-title">{dataset.name}</h3>
                <span className="badge badge-blue">.xlsx</span>
              </div>

              <div className="dataset-card-date">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Uploaded on {formatDate(dataset.uploadDate)}</span>
              </div>

              <p className="dataset-card-desc">
                {dataset.description || 'No description provided for this dataset.'}
              </p>

              {(dataset.rowCount !== undefined || dataset.columnCount !== undefined) && (
                <div className="dataset-card-meta">
                  {dataset.rowCount !== undefined && (
                    <span>
                      <strong>Rows:</strong> {dataset.rowCount.toLocaleString()}
                    </span>
                  )}
                  {dataset.columnCount !== undefined && (
                    <span>
                      • <strong>Columns:</strong> {dataset.columnCount}
                    </span>
                  )}
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <Link
                  to={`/datasets/${dataset.id}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>View Statistics & Charts</span>
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
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
