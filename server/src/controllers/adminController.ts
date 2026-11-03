import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { VehicleModel } from '../models/VehicleModel.js';
import { VehicleVariant } from '../models/VehicleVariant.js';
import { CityPricing } from '../models/CityPricing.js';
import { UsedVehicle } from '../models/UsedVehicle.js';
import { Showroom } from '../models/Showroom.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { TestDriveBooking } from '../models/TestDriveBooking.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { LeadAssignmentService } from '../services/leadAssignmentService.js';

export class AdminController {
  // --- VEHICLE MODELS ---
  public static async createVehicleModel(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        slug,
        brand = 'DriveX',
        category,
        tagline,
        description,
        heroImage,
        galleryImages,
        startingPrice,
        launchYear,
        isFeatured,
        specSummary,
      } = req.body;

      const model = new VehicleModel({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand,
        category,
        tagline,
        description,
        heroImage,
        galleryImages: galleryImages || [heroImage],
        startingPrice,
        launchYear: launchYear || 2026,
        isFeatured: !!isFeatured,
        specSummary,
      });

      await model.save();
      return sendSuccess(res, 'Vehicle model created successfully', model, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create vehicle model', 400, err);
    }
  }

  public static async updateVehicleModel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const model = await VehicleModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!model) return sendError(res, 'Vehicle model not found', 404);
      return sendSuccess(res, 'Vehicle model updated', model);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update vehicle model', 400, err);
    }
  }

  // --- VEHICLE VARIANTS ---
  public static async createVehicleVariant(req: AuthRequest, res: Response) {
    try {
      const variant = new VehicleVariant(req.body);
      await variant.save();
      return sendSuccess(res, 'Vehicle variant created successfully', variant, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create variant', 400, err);
    }
  }

  public static async updateVehicleVariant(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const variant = await VehicleVariant.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!variant) return sendError(res, 'Vehicle variant not found', 404);
      return sendSuccess(res, 'Vehicle variant updated', variant);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update variant', 400, err);
    }
  }

  // --- CITY PRICING ---
  public static async getCityPricingList(req: AuthRequest, res: Response) {
    try {
      const pricing = await CityPricing.find()
        .populate('vehicleModelId', 'name')
        .populate('vehicleVariantId', 'name variantCode exShowroomPrice')
        .sort({ city: 1, createdAt: -1 });
      return sendSuccess(res, 'City pricing records retrieved', pricing);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch pricing records', 500, err);
    }
  }

  public static async createCityPricing(req: AuthRequest, res: Response) {
    try {
      const pricing = new CityPricing(req.body);
      await pricing.save();
      return sendSuccess(res, 'City pricing rule created successfully', pricing, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create pricing rule', 400, err);
    }
  }

  public static async updateCityPricing(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const pricing = await CityPricing.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!pricing) return sendError(res, 'Pricing record not found', 404);
      return sendSuccess(res, 'Pricing record updated successfully', pricing);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update pricing record', 400, err);
    }
  }

  // --- USED CARS ---
  public static async createUsedVehicle(req: AuthRequest, res: Response) {
    try {
      const usedVehicle = new UsedVehicle(req.body);
      await usedVehicle.save();
      return sendSuccess(res, 'Used vehicle added to certified inventory', usedVehicle, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create used vehicle', 400, err);
    }
  }

  public static async updateUsedVehicle(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await UsedVehicle.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) return sendError(res, 'Used vehicle not found', 404);
      return sendSuccess(res, 'Used vehicle inventory updated', updated);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update used vehicle', 400, err);
    }
  }

  // --- CONSULTANTS & STAFF MANAGEMENT ---
  public static async getConsultants(req: AuthRequest, res: Response) {
    try {
      const consultants = await User.find({ role: { $in: ['SALES_CONSULTANT', 'ADMIN'] } })
        .populate('showroomId', 'name code city')
        .select('-passwordHash -refreshToken')
        .sort({ role: 1, activeLeadCount: 1 });
      return sendSuccess(res, 'Staff members retrieved', consultants);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch consultants', 500, err);
    }
  }

  public static async createConsultant(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, phone, showroomId, role = 'SALES_CONSULTANT' } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return sendError(res, 'A user with this email already exists', 409);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'DriveX@2026', salt);

      const consultant = new User({
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        role,
        showroomId: showroomId || undefined,
        activeLeadCount: 0,
        isAvailable: true,
      });

      await consultant.save();
      return sendSuccess(res, 'Staff consultant created successfully', consultant, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create consultant', 400, err);
    }
  }

  public static async toggleConsultantAvailability(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) return sendError(res, 'User not found', 404);

      user.isAvailable = !user.isAvailable;
      await user.save();

      let reallocated = { reallocatedCount: 0, reallocatedLeadIds: [] as string[] };
      // If consultant became offline and autoReassign is requested (or by default)
      if (!user.isAvailable && req.query.autoReassign === 'true') {
        reallocated = await LeadAssignmentService.handleConsultantUnavailable(
          user._id.toString(),
          req.user?.userId,
          req.user?.name || 'Administrator'
        );
      }

      return sendSuccess(
        res,
        `Consultant status changed to ${user.isAvailable ? 'AVAILABLE' : 'OFFLINE'}${
          reallocated.reallocatedCount > 0
            ? `. ${reallocated.reallocatedCount} active leads auto-reassigned.`
            : ''
        }`,
        { id: user._id, isAvailable: user.isAvailable, reallocated }
      );
    } catch (err: any) {
      return sendError(res, 'Failed to toggle availability', 500, err);
    }
  }

  // --- EXECUTIVE ANALYTICS ---
  public static async getExecutiveAnalytics(req: AuthRequest, res: Response) {
    try {
      const [
        totalModels,
        totalVariants,
        totalUsedCars,
        availableUsedCars,
        totalLeads,
        convertedLeads,
        testDrivesTotal,
        testDrivesCompleted,
        consultants,
      ] = await Promise.all([
        VehicleModel.countDocuments({ isActive: true }),
        VehicleVariant.countDocuments({ isAvailable: true }),
        UsedVehicle.countDocuments(),
        UsedVehicle.countDocuments({ status: 'Available' }),
        Lead.countDocuments(),
        Lead.countDocuments({ status: 'CONVERTED' }),
        TestDriveBooking.countDocuments(),
        TestDriveBooking.countDocuments({ status: 'COMPLETED' }),
        User.find({ role: 'SALES_CONSULTANT' }).populate('showroomId', 'name'),
      ]);

      const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

      // Monthly sales projection
      const monthlyRevenue = convertedLeads * 1450000; // Average ₹14.5L ticket size

      return sendSuccess(res, 'Executive dealership analytics retrieved', {
        kpis: {
          totalModels,
          totalVariants,
          totalUsedCars,
          availableUsedCars,
          totalLeads,
          convertedLeads,
          conversionRate: `${conversionRate}%`,
          testDrivesTotal,
          testDrivesCompleted,
          monthlyRevenue,
        },
        consultantsWorkload: consultants.map((c) => ({
          id: c._id,
          name: c.name,
          email: c.email,
          showroom: (c.showroomId as any)?.name || 'Central Pool',
          activeLeads: c.activeLeadCount,
          isAvailable: c.isAvailable,
        })),
      });
    } catch (err: any) {
      return sendError(res, 'Failed to fetch analytics', 500, err);
    }
  }
}
