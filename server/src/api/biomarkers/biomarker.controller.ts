import { NextFunction, Request, Response } from "express";
import * as BioMarkerService from './biomarker.service';

export const createBioMarker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        const result = await BioMarkerService.createBioMarker(req.body, userId);
        res.status(201);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getBioMarkers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await BioMarkerService.getBioMarkers(req.query);
      res.status(200);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
};

export const getBioMarker = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await BioMarkerService.getBioMarker(req.params.id);
      res.status(200);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.body?.status;
    if(status) {
      const result = await BioMarkerService.updateStatus(req.params.id, status);
      res.status(200);
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400);
      res.json({
        success: false,
        error: 'Status required'
      });
    }    
  } catch (error) {
    next(error);
  }
};
