import { Request, Response } from 'express';
import { Showroom } from '../models/Showroom.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ShowroomController {
  public static async getAllShowrooms(req: Request, res: Response) {
    try {
      const showrooms = await Showroom.find({ isActive: true }).sort({ name: 1 });
      return sendSuccess(res, 'Showrooms retrieved successfully', showrooms);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch showrooms', 500, err);
    }
  }

  public static async getShowroomById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const showroom = await Showroom.findById(id);
      if (!showroom) {
        return sendError(res, `Showroom ${id} not found`, 404);
      }
      return sendSuccess(res, 'Showroom details retrieved', showroom);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch showroom', 500, err);
    }
  }
}
