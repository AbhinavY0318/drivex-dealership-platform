import { Request, Response } from 'express';
import { VehicleModel } from '../models/VehicleModel.js';
import { VehicleVariant } from '../models/VehicleVariant.js';
import { PricingService } from '../services/pricingService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emiCalculationSchema } from '../validators/schemas.js';

export class VehicleController {
  public static async getAllModels(req: Request, res: Response) {
    try {
      const { category, fuel, transmission, minPrice, maxPrice, search } = req.query;

      const query: any = { isActive: true };

      if (category && typeof category === 'string' && category !== 'ALL') {
        query.category = category;
      }

      if (search && typeof search === 'string') {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { tagline: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (minPrice || maxPrice) {
        query.startingPrice = {};
        if (minPrice) query.startingPrice.$gte = Number(minPrice);
        if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
      }

      const models = await VehicleModel.find(query).sort({ isFeatured: -1, startingPrice: 1 });

      // Fetch variants for each model to display fuel & transmission badges
      const modelIds = models.map((m) => m._id);
      const variants = await VehicleVariant.find({ modelId: { $in: modelIds }, isAvailable: true });

      const modelsWithVariants = models.map((model) => {
        const modelVariants = variants.filter((v) => v.modelId.toString() === model._id.toString());
        const fuels = Array.from(new Set(modelVariants.map((v) => v.fuelType)));
        const transmissions = Array.from(new Set(modelVariants.map((v) => v.transmission)));

        return {
          ...model.toObject(),
          availableFuels: fuels,
          availableTransmissions: transmissions,
          variantCount: modelVariants.length,
        };
      });

      // Filter by fuel or transmission if specified
      let filtered = modelsWithVariants;
      if (fuel && typeof fuel === 'string' && fuel !== 'ALL') {
        filtered = filtered.filter((m) => m.availableFuels.includes(fuel as any));
      }
      if (transmission && typeof transmission === 'string' && transmission !== 'ALL') {
        filtered = filtered.filter((m) => m.availableTransmissions.includes(transmission as any));
      }

      return sendSuccess(res, 'Vehicle models retrieved', filtered);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch vehicle models', 500, err);
    }
  }

  public static async getModelBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const model = await VehicleModel.findOne({ slug: slug.toLowerCase(), isActive: true });

      if (!model) {
        return sendError(res, `Vehicle model "${slug}" not found`, 404);
      }

      const variants = await VehicleVariant.find({ modelId: model._id, isAvailable: true }).sort({
        exShowroomPrice: 1,
      });

      return sendSuccess(res, 'Vehicle model details retrieved', {
        model,
        variants,
      });
    } catch (err: any) {
      return sendError(res, 'Failed to fetch vehicle model details', 500, err);
    }
  }

  public static async getVariantPricing(req: Request, res: Response) {
    try {
      const variantId = req.params.variantId as string;
      const city = (req.query.city as string) || 'Lucknow';

      const pricing = await PricingService.getOnRoadPrice(variantId, city);
      return sendSuccess(res, `On-road pricing for ${pricing.city} retrieved`, pricing);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to calculate on-road pricing', 400, err);
    }
  }

  public static async calculateEMI(req: Request, res: Response) {
    try {
      const parsed = emiCalculationSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = PricingService.calculateEMI(parsed.data);
      return sendSuccess(res, 'EMI calculated successfully', result);
    } catch (err: any) {
      return sendError(res, err.message || 'EMI calculation error', 400, err);
    }
  }
}
