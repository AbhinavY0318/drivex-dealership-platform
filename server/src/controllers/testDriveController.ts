import { Request, Response } from 'express';
import { TestDriveBooking } from '../models/TestDriveBooking.js';
import { TestDriveService } from '../services/testDriveService.js';
import { bookTestDriveSchema } from '../validators/schemas.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class TestDriveController {
  public static async getAvailability(req: Request, res: Response) {
    try {
      const { showroomId, vehicleModelId, date } = req.query;

      if (!showroomId || !vehicleModelId || !date) {
        return sendError(
          res,
          'Missing query parameters: showroomId, vehicleModelId, and date (YYYY-MM-DD) are required',
          400
        );
      }

      const slots = await TestDriveService.getAvailableSlots(
        showroomId as string,
        vehicleModelId as string,
        date as string
      );

      return sendSuccess(res, 'Test drive availability retrieved', slots);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch availability', 500, err);
    }
  }

  public static async bookTestDrive(req: AuthRequest, res: Response) {
    try {
      const parsed = bookTestDriveSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const customerId = req.user?.userId;

      const booking = await TestDriveService.bookSlot({
        ...parsed.data,
        customerId,
      });

      return sendSuccess(
        res,
        'Test drive appointment confirmed successfully! Our dealership executive will greet you at the showroom.',
        booking,
        201
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to book test drive', 400, err);
    }
  }

  public static async getMyBookings(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      const bookings = await TestDriveBooking.find({
        $or: [{ customerId: req.user.userId }, { customerEmail: req.user.email }],
      })
        .populate('vehicleModelId')
        .populate('vehicleVariantId')
        .populate('showroomId')
        .sort({ bookingDate: -1, createdAt: -1 });

      return sendSuccess(res, 'Customer bookings retrieved', bookings);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch bookings', 500, err);
    }
  }

  public static async getConsultantBookings(req: AuthRequest, res: Response) {
    try {
      const { showroomId, date, status } = req.query;
      const user = req.user!;

      const query: any = {};

      if (user.role === 'SALES_CONSULTANT') {
        if (user.showroomId) query.showroomId = user.showroomId;
      } else if (showroomId) {
        query.showroomId = showroomId;
      }

      if (date) query.bookingDate = date;
      if (status && status !== 'ALL') query.status = status;

      const bookings = await TestDriveBooking.find(query)
        .populate('vehicleModelId')
        .populate('vehicleVariantId')
        .populate('showroomId')
        .populate('consultantId', 'name email phone')
        .sort({ bookingDate: 1, timeSlot: 1 });

      return sendSuccess(res, 'Showroom test drive appointments retrieved', bookings);
    } catch (err: any) {
      return sendError(res, 'Failed to fetch consultant bookings', 500, err);
    }
  }

  public static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, cancellationReason } = req.body;

      if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return sendError(res, 'Invalid test drive status', 400);
      }

      const updated = await TestDriveService.updateBookingStatus(id, status, cancellationReason);
      return sendSuccess(res, `Booking status updated to ${status}`, updated);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update booking status', 400, err);
    }
  }
}
