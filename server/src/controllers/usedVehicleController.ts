import { Request, Response } from 'express';
import { UsedVehicle } from '../models/UsedVehicle.js';
import { sanitizeUsedVehiclePublic, sanitizeUsedVehiclesPublicList } from '../utils/masking.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AIService } from '../services/aiService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class UsedVehicleController {
  public static async getAllUsedVehicles(req: Request, res: Response) {
    try {
      const {
        model,
        fuel,
        minYear,
        maxYear,
        maxKm,
        minPrice,
        maxPrice,
        status,
        search,
        page = '1',
        limit = '12',
      } = req.query;

      const query: any = {};

      if (model && model !== 'ALL') {
        query.model = { $regex: String(model), $options: 'i' };
      }

      if (fuel && fuel !== 'ALL') {
        query.fuelType = fuel;
      }

      if (status && status !== 'ALL') {
        query.status = status;
      } else {
        // By default for public buyers, show Available and Booked cars
        query.status = { $in: ['Available', 'Booked'] };
      }

      if (minYear || maxYear) {
        query.year = {};
        if (minYear) query.year.$gte = Number(minYear);
        if (maxYear) query.year.$lte = Number(maxYear);
      }

      if (maxKm) {
        query.kilometres = { $lte: Number(maxKm) };
      }

      if (minPrice || maxPrice) {
        query.askingPrice = {};
        if (minPrice) query.askingPrice.$gte = Number(minPrice);
        if (maxPrice) query.askingPrice.$lte = Number(maxPrice);
      }

      if (search && typeof search === 'string') {
        query.$or = [
          { model: { $regex: search, $options: 'i' } },
          { variant: { $regex: search, $options: 'i' } },
          { stockId: { $regex: search, $options: 'i' } },
        ];
      }

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 12;
      const skip = (pageNum - 1) * limitNum;

      const [total, vehicles] = await Promise.all([
        UsedVehicle.countDocuments(query),
        UsedVehicle.find(query)
          .populate('showroomId', 'name code address city')
          .sort({ isFeatured: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
      ]);

      // MASK REGISTRATION NUMBERS FOR PUBLIC CONSUMPTION
      const sanitized = sanitizeUsedVehiclesPublicList(vehicles);

      return sendSuccess(
        res,
        'Used vehicles retrieved',
        sanitized,
        200,
        {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        }
      );
    } catch (err: any) {
      return sendError(res, 'Failed to fetch used vehicles', 500, err);
    }
  }

  public static async getUsedVehicleById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const vehicle = await UsedVehicle.findById(id).populate('showroomId');
      if (!vehicle) {
        return sendError(res, `Used vehicle with ID ${id} not found`, 404);
      }

      // Check if user is staff (ADMIN or SALES_CONSULTANT)
      const isStaff = req.user && ['ADMIN', 'SALES_CONSULTANT'].includes(req.user.role);

      let payload = vehicle.toObject();
      if (!isStaff) {
        // Mask registration number for public
        payload = sanitizeUsedVehiclePublic(payload);
        delete payload.suggestedPriceBand;
      }

      return sendSuccess(res, 'Used vehicle details retrieved', payload);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch used vehicle details', 500, err);
    }
  }

  public static async getPriceSuggestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const vehicle = await UsedVehicle.findById(id);
      if (!vehicle) {
        return sendError(res, 'Used vehicle not found', 404);
      }

      // Estimate baseline original ex-showroom price
      const baselineOriginal = vehicle.askingPrice * 1.4;
      const estimate = AIService.calculateUsedCarPriceBand(
        baselineOriginal,
        vehicle.year,
        vehicle.kilometres,
        vehicle.previousOwners
      );

      return sendSuccess(res, 'AI used-car price suggestion retrieved', {
        vehicleId: vehicle._id,
        stockId: vehicle.stockId,
        currentAskingPrice: vehicle.askingPrice,
        estimate,
      });
    } catch (err: any) {
      return sendError(res, 'Failed to calculate price suggestion', 500, err);
    }
  }
}
