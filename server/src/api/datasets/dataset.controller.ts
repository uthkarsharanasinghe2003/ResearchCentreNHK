import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as DatasetService from './dataset.service';

/**
 * Handles uploading an Excel file, parsing its contents, computing summary statistics,
 * and storing the dataset in MongoDB.
 */
export const uploadDataset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: 'No file uploaded. Please upload an Excel (.xlsx, .xls) file.',
      });
    }

    const rows = DatasetService.parseExcelBuffer(req.file.buffer);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        message: 'The uploaded Excel file contains no readable data.',
      });
    }

    // Use name from request body or derive from original filename
    const originalName = req.file.originalname || 'Untitled Dataset';
    const cleanFileName = originalName.replace(/\.[^/.]+$/, '').trim();
    const name = (req.body.name && req.body.name.trim()) ? req.body.name.trim() : cleanFileName;
    const description = req.body.description ? req.body.description.trim() : '';

    const savedDataset = await DatasetService.createDataset(name, description, rows);

    return res.status(201).json({
      _id: savedDataset._id,
      id: savedDataset._id,
      name: savedDataset.name,
      summary: savedDataset.summary,
      dataset: savedDataset,
      message: 'Dataset uploaded and processed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lists all datasets excluding rawData field.
 */
export const listDatasets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const datasets = await DatasetService.getAllDatasets();

    const formattedList = datasets.map((d: any) => ({
      _id: d._id,
      id: d._id,
      name: d.name,
      description: d.description,
      uploadedAt: d.uploadedAt,
      uploadDate: d.uploadedAt,
      columns: d.columns,
      summary: d.summary,
      rowCount: d.summary && d.summary.length > 0 ? d.summary[0].count : undefined,
      columnCount: d.columns ? d.columns.length : 0,
    }));

    return res.status(200).json(formattedList);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a single dataset by ID, returning full summary statistics and chart data formatted for Recharts.
 */
export const getDataset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const dataset = await DatasetService.getDatasetById(id);
    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const summary = dataset.summary || [];
    const chartData = summary.map((s: any) => ({
      column: s.column,
      mean: s.mean,
      name: s.column,
      value: s.mean,
    }));

    const responseData = {
      _id: dataset._id,
      id: dataset._id,
      name: dataset.name,
      description: dataset.description,
      uploadedAt: dataset.uploadedAt,
      uploadDate: dataset.uploadedAt,
      columns: dataset.columns,
      rawData: dataset.rawData,
      previewRows: dataset.rawData ? dataset.rawData.slice(0, 10) : [],
      rowCount: dataset.rawData ? dataset.rawData.length : (summary.length > 0 ? summary[0].count : 0),
      columnCount: dataset.columns ? dataset.columns.length : 0,
      summary: summary,
      summaryStats: summary.map((s: any) => ({
        columnName: s.column,
        column: s.column,
        count: s.count,
        mean: s.mean,
        min: s.min,
        max: s.max,
        stdDev: s.stdDev,
      })),
      chartData,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing dataset's name and/or description.
 */
export const updateDataset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const { name, description } = req.body;
    const updated = await DatasetService.updateDataset(id, { name, description });

    if (!updated) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    return res.status(200).json({
      message: 'Dataset updated successfully',
      dataset: updated,
      ...updated,
      id: updated._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a dataset by ID.
 */
export const deleteDataset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const deleted = await DatasetService.deleteDataset(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    return res.status(200).json({
      message: 'Dataset deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
};

