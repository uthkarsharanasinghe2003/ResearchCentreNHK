import XLSX from 'xlsx';
import * as ss from 'simple-statistics';
import Dataset, { IDatasetSummary } from './dataset.model';

/**
 * Extracts all unique column names found across row objects.
 */
export const extractColumns = (rows: Record<string, any>[]): string[] => {
  const columnSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columnSet.add(key);
    }
  }
  return Array.from(columnSet);
};

/**
 * Reads the Excel file buffer using xlsx, converts the first sheet to an array of row objects.
 */
export const parseExcelBuffer = (buffer: Buffer): Record<string, any>[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return [];
  }
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
  return rows;
};

/**
 * For every column that is numeric, calculates mean, min, max, count, and stdDev using simple-statistics.
 */
export const computeSummary = (rows: Record<string, any>[]): IDatasetSummary[] => {
  if (!rows || rows.length === 0) {
    return [];
  }

  const columns = extractColumns(rows);
  const summary: IDatasetSummary[] = [];

  for (const col of columns) {
    const numericValues: number[] = [];
    let hasNonNumeric = false;

    for (const row of rows) {
      const val = row[col];
      // Skip empty/null/undefined
      if (val === undefined || val === null || val === '') {
        continue;
      }

      if (typeof val === 'number' && !isNaN(val)) {
        numericValues.push(val);
      } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val.trim()))) {
        numericValues.push(Number(val.trim()));
      } else {
        hasNonNumeric = true;
        break;
      }
    }

    // Only compute summary for columns that have numeric data and no non-numeric data
    if (numericValues.length > 0 && !hasNonNumeric) {
      const mean = Number(ss.mean(numericValues).toFixed(2));
      const min = Number(ss.min(numericValues).toFixed(2));
      const max = Number(ss.max(numericValues).toFixed(2));
      const count = numericValues.length;
      const stdDev = numericValues.length > 1
        ? Number(ss.standardDeviation(numericValues).toFixed(2))
        : 0;

      summary.push({
        column: col,
        mean,
        min,
        max,
        count,
        stdDev,
      });
    }
  }

  return summary;
};

/**
 * Builds the full dataset document (columns, rawData, summary) and saves it via the model.
 */
export const createDataset = async (
  name: string,
  description: string | undefined,
  rows: Record<string, any>[]
) => {
  const columns = extractColumns(rows);
  const summary = computeSummary(rows);

  const dataset = new Dataset({
    name,
    description,
    uploadedAt: new Date(),
    columns,
    rawData: rows,
    summary,
  });

  return await dataset.save();
};

/**
 * Returns all datasets but excludes the rawData field (too large for list view).
 */
export const getAllDatasets = async () => {
  return await Dataset.find({}, { rawData: 0 }).sort({ uploadedAt: -1 }).lean();
};

/**
 * Returns the full dataset including rawData and summary by ID.
 */
export const getDatasetById = async (id: string) => {
  return await Dataset.findById(id).lean();
};

/**
 * Updates an existing dataset's name and/or description by ID.
 */
export const updateDataset = async (
  id: string,
  updateData: { name?: string; description?: string }
) => {
  const query: any = {};
  if (updateData.name !== undefined) {
    query.name = updateData.name;
  }
  if (updateData.description !== undefined) {
    query.description = updateData.description;
  }

  return await Dataset.findByIdAndUpdate(
    id,
    { $set: query },
    { new: true }
  ).lean();
};

/**
 * Deletes a dataset by ID.
 */
export const deleteDataset = async (id: string) => {
  return await Dataset.findByIdAndDelete(id).lean();
};

