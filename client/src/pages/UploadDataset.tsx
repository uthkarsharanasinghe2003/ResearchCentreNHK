import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadDataset } from '../api/datasetApi';

export const UploadDataset: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedDatasetId, setUploadedDatasetId] = useState<string | number | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError('Invalid file type. Please upload an Excel spreadsheet (.xlsx or .xls).');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Auto-fill dataset name from filename if empty
    if (!datasetName) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setDatasetName(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an Excel (.xlsx) file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (datasetName.trim()) {
      formData.append('name', datasetName.trim());
    }
    if (description.trim()) {
      formData.append('description', description.trim());
    }

    try {
      const result = await uploadDataset(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        }
      });

      setSuccessMessage(
        result.message || 'Dataset uploaded and processed successfully!'
      );
      const newId = result.id || result.dataset?.id;
      if (newId) {
        setUploadedDatasetId(newId);
        // Automatically redirect to the dataset detail page after 1.5s
        setTimeout(() => {
          navigate(`/datasets/${newId}`);
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to upload file to POST /api/v1/datasets/upload.';
      setError(
        `${msg} (Ensure your backend server is running and accepting multipart uploads).`
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Upload Research Dataset</h1>
          <p className="page-subtitle">
            Upload an Excel (.xlsx) spreadsheet to generate automated summary statistics and Recharts visualizations.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-danger">
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
          <div>
            <strong>Upload Error:</strong> {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <strong>Success:</strong> {successMessage}
            <div style={{ marginTop: '0.25rem' }}>
              Redirecting to dataset analytics...{' '}
              {uploadedDatasetId && (
                <Link
                  to={`/datasets/${uploadedDatasetId}`}
                  style={{ marginLeft: '0.5rem', color: 'inherit', textDecoration: 'underline' }}
                >
                  Click here if not redirected
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Form Card */}
      <div className="upload-card">
        <form onSubmit={handleSubmit}>
          {/* Dropzone Area */}
          {!selectedFile ? (
            <div
              className={`dropzone ${isDragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="dropzone-icon">
                <svg
                  width="26"
                  height="26"
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
              </div>
              <h3 className="dropzone-title">Click to select or drag & drop an Excel file</h3>
              <p className="dropzone-subtitle">Supported formats: .xlsx, .xls (Maximum recommended: 50MB)</p>
            </div>
          ) : (
            <div className="file-preview-card">
              <div className="file-preview-info">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="22"
                    height="22"
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
                <div>
                  <div className="file-preview-name">{selectedFile.name}</div>
                  <div className="file-preview-size">{formatFileSize(selectedFile.size)}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={uploading}
                className="btn btn-sm btn-secondary"
                title="Remove selected file"
              >
                Change File
              </button>
            </div>
          )}

          {/* Dataset Name Field */}
          <div className="form-group">
            <label htmlFor="dataset-name" className="form-label">
              Dataset Name / Title <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="dataset-name"
              type="text"
              className="form-input"
              placeholder="e.g. Clinical Study Cohort 2026"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              required
              disabled={uploading}
            />
            <p className="form-hint">A recognizable title displayed on the dashboard.</p>
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="dataset-desc" className="form-label">
              Description / Research Notes (Optional)
            </label>
            <textarea
              id="dataset-desc"
              className="form-textarea"
              placeholder="Provide context regarding data collection methodology, sample cohort, or study parameters..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
            />
            <p className="form-hint">Brief summary visible on the dataset details page.</p>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="progress-label">
                <span>Uploading spreadsheet...</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem',
            }}
          >
            <Link to="/" className="btn btn-secondary" style={{ pointerEvents: uploading ? 'none' : 'auto' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || !datasetName.trim() || uploading}
            >
              {uploading ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: '16px', height: '16px', borderWidth: '2px' }}
                  />
                  <span>Processing & Uploading...</span>
                </>
              ) : (
                <>
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload & Analyze Dataset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDataset;
