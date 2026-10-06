import axios from 'axios';

// Base API URL configured via .env (VITE_API_BASE_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Axios instance configured with base URL
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Data Interfaces
export interface DatasetSummaryStat {
  columnName: string;
  count: number;
  mean: number;
  min: number;
  max: number;
  median?: number;
  stdDev?: number;
}

export interface BarChartDataPoint {
  name: string | number;
  value: number;
  [key: string]: any;
}

export interface DatasetListItem {
  id: string | number;
  name: string;
  filename?: string;
  uploadDate: string;
  description?: string;
  rowCount?: number;
  columnCount?: number;
}

export interface DatasetDetail {
  id: string | number;
  name: string;
  filename?: string;
  uploadDate: string;
  description?: string;
  rowCount?: number;
  columnCount?: number;
  summaryStats: DatasetSummaryStat[];
  chartData?: Record<string, BarChartDataPoint[]> | BarChartDataPoint[];
  previewRows?: Record<string, any>[];
}

export interface UploadDatasetPayload {
  file: File;
  name?: string;
  description?: string;
}

export interface UploadResponse {
  message?: string;
  id?: string | number;
  dataset?: DatasetDetail | DatasetListItem;
  [key: string]: any;
}

/**
 * GET /api/v1/datasets
 * Fetches the list of all uploaded datasets.
 */
export const getDatasets = async (): Promise<DatasetListItem[]> => {
  const response = await apiClient.get('/api/v1/datasets');
  const resData = response.data;

  // Resiliently handle various backend formats (array, { data: [] }, { datasets: [] })
  if (Array.isArray(resData)) {
    return resData;
  }
  if (Array.isArray(resData?.data)) {
    return resData.data;
  }
  if (Array.isArray(resData?.datasets)) {
    return resData.datasets;
  }
  return [];
};

/**
 * GET /api/v1/datasets/:id
 * Fetches a single dataset by ID with summary statistics and chart-ready data.
 */
export const getDatasetById = async (id: string | number): Promise<DatasetDetail> => {
  const response = await apiClient.get(`/api/v1/datasets/${id}`);
  const resData = response.data;

  // Handle { data: {...} } or direct {...}
  return resData?.data ?? resData;
};

/**
 * POST /api/v1/datasets/upload
 * Uploads an Excel file (.xlsx) with optional name and description.
 */
export const uploadDataset = async (
  formData: FormData,
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
): Promise<UploadResponse> => {
  const response = await apiClient.post('/api/v1/datasets/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress) {
        onUploadProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
        });
      }
    },
  });

  return response.data;
};

// Mock/Sample datasets for preview when the backend is offline/not yet launched
export const SAMPLE_DATASETS: DatasetDetail[] = [
  {
    id: 'sample-1',
    name: 'National Healthcare Survey 2025',
    filename: 'nhk_survey_2025.xlsx',
    uploadDate: '2026-09-15T09:30:00Z',
    description: 'Secondary clinical and demographic data assessing patient recovery rates, systolic blood pressure, and treatment duration across regional centers.',
    rowCount: 1250,
    columnCount: 8,
    summaryStats: [
      { columnName: 'Patient Age', count: 1250, mean: 54.2, min: 18, max: 92, median: 55, stdDev: 14.8 },
      { columnName: 'Systolic BP (mmHg)', count: 1245, mean: 128.6, min: 94, max: 188, median: 126, stdDev: 16.2 },
      { columnName: 'Recovery Days', count: 1250, mean: 14.3, min: 2, max: 45, median: 12, stdDev: 6.9 },
      { columnName: 'Treatment Cost ($k)', count: 1238, mean: 8.75, min: 1.2, max: 28.5, median: 7.4, stdDev: 4.1 },
    ],
    chartData: {
      'Patient Age': [
        { name: '18-29', value: 180 },
        { name: '30-44', value: 310 },
        { name: '45-59', value: 420 },
        { name: '60-74', value: 240 },
        { name: '75+', value: 100 },
      ],
      'Systolic BP (mmHg)': [
        { name: '< 110', value: 145 },
        { name: '110-129', value: 520 },
        { name: '130-139', value: 340 },
        { name: '140-159', value: 180 },
        { name: '160+', value: 60 },
      ],
      'Recovery Days': [
        { name: '1-7 days', value: 260 },
        { name: '8-14 days', value: 580 },
        { name: '15-21 days', value: 290 },
        { name: '22-30 days', value: 90 },
        { name: '30+ days', value: 30 },
      ],
      'Treatment Cost ($k)': [
        { name: '$1k-5k', value: 310 },
        { name: '$5k-10k', value: 590 },
        { name: '$10k-15k', value: 230 },
        { name: '$15k-20k', value: 85 },
        { name: '$20k+', value: 23 },
      ],
    },
    previewRows: [
      { id: 1, age: 45, systolicBP: 122, recoveryDays: 10, treatmentCost: 5.4, outcome: 'Recovered' },
      { id: 2, age: 62, systolicBP: 142, recoveryDays: 18, treatmentCost: 9.8, outcome: 'Recovered' },
      { id: 3, age: 34, systolicBP: 115, recoveryDays: 7, treatmentCost: 3.2, outcome: 'Recovered' },
      { id: 4, age: 71, systolicBP: 156, recoveryDays: 24, treatmentCost: 14.1, outcome: 'Monitoring' },
      { id: 5, age: 58, systolicBP: 130, recoveryDays: 12, treatmentCost: 7.9, outcome: 'Recovered' },
    ],
  },
  {
    id: 'sample-2',
    name: 'District Environmental Biomarkers',
    filename: 'environmental_biomarkers.xlsx',
    uploadDate: '2026-09-28T14:15:00Z',
    description: 'Air particulate matter, blood lead levels, and lung function indices collected during district-wide environmental health monitoring.',
    rowCount: 860,
    columnCount: 6,
    summaryStats: [
      { columnName: 'PM2.5 Exposure (µg/m³)', count: 860, mean: 38.4, min: 11.2, max: 94.6, median: 35.1, stdDev: 12.3 },
      { columnName: 'Blood Lead Level (µg/dL)', count: 855, mean: 3.8, min: 0.5, max: 14.2, median: 3.2, stdDev: 2.1 },
      { columnName: 'FEV1 Score (%)', count: 860, mean: 88.2, min: 52.0, max: 115.0, median: 89.5, stdDev: 11.4 },
    ],
    chartData: {
      'PM2.5 Exposure (µg/m³)': [
        { name: '0-25', value: 160 },
        { name: '26-50', value: 450 },
        { name: '51-75', value: 190 },
        { name: '76-100', value: 60 },
      ],
      'Blood Lead Level (µg/dL)': [
        { name: '0-2', value: 210 },
        { name: '2.1-4', value: 410 },
        { name: '4.1-6', value: 160 },
        { name: '6.1-10', value: 60 },
        { name: '10+', value: 15 },
      ],
      'FEV1 Score (%)': [
        { name: '< 70%', value: 65 },
        { name: '70-79%', value: 145 },
        { name: '80-89%', value: 310 },
        { name: '90-99%', value: 230 },
        { name: '100%+', value: 110 },
      ],
    },
  },
  {
    id: 'sample-3',
    name: 'Cognitive Assessment & Reaction Times',
    filename: 'cognitive_study_trials.xlsx',
    uploadDate: '2026-10-02T11:45:00Z',
    description: 'Trial results from neuropsychological cognitive tests measuring reaction time in milliseconds and accuracy scores across age cohorts.',
    rowCount: 2400,
    columnCount: 5,
    summaryStats: [
      { columnName: 'Reaction Time (ms)', count: 2400, mean: 412.5, min: 210, max: 890, median: 395, stdDev: 88.4 },
      { columnName: 'Accuracy Score (%)', count: 2400, mean: 92.4, min: 64.0, max: 100.0, median: 94.0, stdDev: 5.6 },
      { columnName: 'Session Duration (min)', count: 2400, mean: 22.8, min: 14.0, max: 36.0, median: 22.0, stdDev: 3.8 },
    ],
    chartData: {
      'Reaction Time (ms)': [
        { name: '200-300ms', value: 240 },
        { name: '301-400ms', value: 1120 },
        { name: '401-500ms', value: 760 },
        { name: '501-600ms', value: 210 },
        { name: '600ms+', value: 70 },
      ],
      'Accuracy Score (%)': [
        { name: '< 80%', value: 95 },
        { name: '80-89%', value: 420 },
        { name: '90-94%', value: 980 },
        { name: '95-99%', value: 740 },
        { name: '100%', value: 165 },
      ],
      'Session Duration (min)': [
        { name: '10-18m', value: 320 },
        { name: '19-24m', value: 1450 },
        { name: '25-30m', value: 540 },
        { name: '30m+', value: 90 },
      ],
    },
  },
];
