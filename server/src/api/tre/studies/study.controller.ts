import { NextFunction, Request, Response } from "express";
import * as StudyService from './study.service';

export const createStudy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        const result = await StudyService.createStudy(req.body, userId);
        res.status(201);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const updateStudy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudyService.updateStudy(req.params.id, req.body);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const updateStudyVariablesOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('updateStudyVariablesOrder')
        const result = await StudyService.updateStudyVariablesOrder(req.params.id, req.body);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getStudies = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const userId = req.user?.user_id;
      const result = await StudyService.getStudies(req.query, userId!);
      res.status(200);
      res.json({
          success: true,
          data: result
      });
  } catch (error) {
      next(error);
  }
};

export const getEligbleUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await StudyService.getEligbleUsers(req.params.id, (req.query?.keyWord ?? '').toString());
      res.status(200);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
};

export const addMemberToStudy = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const userId = req.user?.user_id;
      const result = await StudyService.addMemberToStudy(req.params.id, req.body, userId);
      res.status(201);
      res.json({
          success: true,
          data: result
      });
  } catch (error) {
      next(error);
  }
};

export const getStudy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudyService.getStudy(req.params.id);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const createResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        const result = await StudyService.createResult(req.params.id, req.body, userId);
        res.status(201);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const deleteResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudyService.deleteResult(req.params.id, req.params.resultId);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const createResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        const result = await StudyService.createResults(req.params.id, req.body, userId);
        res.status(201);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};


export const getResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        const result = await StudyService.getResults(req.query, userId!);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getAdvancedResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        const result = await StudyService.getResults(req.body, userId!);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const downloadResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        const result = await StudyService.downloadResults(req.body, userId!, res);
    } catch (error) {
        next(error);
    }
};

export const downloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await StudyService.downloadTemplate((req.params.id?.toString() ?? ''), res);
    } catch (error) {
        next(error);
    }
};

export const getResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudyService.getResult(req.params.id);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const changeResultStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudyService.changeResultStatus(req.params.id, req.body.status);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const validateUniqueVariables = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudyService.validateUniqueVariables(req.params.id, req.body);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};