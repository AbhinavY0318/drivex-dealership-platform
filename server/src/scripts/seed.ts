import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Showroom,
  VehicleModel,
  VehicleVariant,
  CityPricing,
  UsedVehicle,
  Lead,
  LeadAssignmentHistory,
  TestDriveBooking,
  DemoVehicle,
} from '../models/index.js';

export const seedDatabase = async (forceClear: boolean = false): Promise<void> => {
  const showroomCount = await Showroom.countDocuments();
  if (!forceClear && showroomCount > 0) {
    console.log('[Seed] Database already populated with seed records. Skipping.');
    return;
  }

  console.log('[Seed] Clearing existing dealership collections...');
  await Promise.all([
    User.deleteMany({}),
    Showroom.deleteMany({}),
    VehicleModel.deleteMany({}),
    VehicleVariant.deleteMany({}),
    CityPricing.deleteMany({}),
    UsedVehicle.deleteMany({}),
    Lead.deleteMany({}),
    LeadAssignmentHistory.deleteMany({}),
    TestDriveBooking.deleteMany({}),
    DemoVehicle.deleteMany({}),
  ]);

  console.log('[Seed] Seeding Lucknow Showrooms...');
  const showrooms = await Showroom.create([
    {
      name: 'DriveX Hazratganj Flagship Showroom',
      code: 'LKO-HZG',
      address: 'Plot 14, Mahatma Gandhi Marg, Hazratganj',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      phone: '+91 522 2618900',
      email: 'hazratganj@drivex.in',
      operatingHours: '09:30 AM - 08:00 PM (Daily)',
      coordinates: { lat: 26.8488, lng: 80.9457 },
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    },
    {
      name: 'DriveX Gomti Nagar Experience Centre',
      code: 'LKO-GMN',
      address: 'TCG 4/4, Vibhuti Khand, Gomti Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
      phone: '+91 522 4022444',
      email: 'gomtinagar@drivex.in',
      operatingHours: '09:30 AM - 08:00 PM (Daily)',
      coordinates: { lat: 26.8656, lng: 81.0028 },
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    },
    {
      name: 'DriveX Kanpur Road Mega Hub & Certified Yard',
      code: 'LKO-KNP',
      address: 'Transport Nagar Metro Depot Road, Kanpur Road',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226012',
      phone: '+91 522 2439120',
      email: 'kanpurroad@drivex.in',
      operatingHours: '09:00 AM - 07:30 PM (Daily)',
      coordinates: { lat: 26.7782, lng: 80.8926 },
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    },
  ]);

  const [hzgShowroom, gmnShowroom, knpShowroom] = showrooms;

  console.log('[Seed] Seeding Staff & Customer Accounts...');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@2026', salt);
  const consultantPass = await bcrypt.hash('Consultant@2026', salt);
  const buyerPass = await bcrypt.hash('Buyer@2026', salt);

  const users = await User.create([
    {
      name: 'Rajesh Verma (General Manager)',
      email: 'admin@drivex.in',
      passwordHash: adminPass,
      role: 'ADMIN',
      phone: '+91 98390 12001',
      isAvailable: true,
    },
    {
      name: 'Rohit Sharma',
      email: 'rohit.sharma@drivex.in',
      passwordHash: consultantPass,
      role: 'SALES_CONSULTANT',
      phone: '+91 98390 12002',
      showroomId: hzgShowroom._id,
      activeLeadCount: 2,
      isAvailable: true,
      lastAssignedAt: new Date(Date.now() - 3600000),
    },
    {
      name: 'Priya Verma',
      email: 'priya.verma@drivex.in',
      passwordHash: consultantPass,
      role: 'SALES_CONSULTANT',
      phone: '+91 98390 12003',
      showroomId: hzgShowroom._id,
      activeLeadCount: 1,
      isAvailable: true,
      lastAssignedAt: new Date(Date.now() - 7200000),
    },
    {
      name: 'Amit Singh',
      email: 'amit.singh@drivex.in',
      passwordHash: consultantPass,
      role: 'SALES_CONSULTANT',
      phone: '+91 98390 12004',
      showroomId: gmnShowroom._id,
      activeLeadCount: 0,
      isAvailable: true,
      lastAssignedAt: new Date(Date.now() - 10800000),
    },
    {
      name: 'Sneha Patel',
      email: 'sneha.patel@drivex.in',
      passwordHash: consultantPass,
      role: 'SALES_CONSULTANT',
      phone: '+91 98390 12005',
      showroomId: knpShowroom._id,
      activeLeadCount: 1,
      isAvailable: true,
      lastAssignedAt: new Date(Date.now() - 14400000),
    },
    {
      name: 'Vikram Malhotra',
      email: 'customer@drivex.in',
      passwordHash: buyerPass,
      role: 'BUYER',
      phone: '+91 94150 99881',
      isAvailable: true,
    },
  ]);

  const [adminUser, rohitUser, priyaUser, amitUser, snehaUser, buyerUser] = users;

  console.log('[Seed] Seeding Vehicle Models & Variants...');
  // Model H (Client Specified)
  const modelH = await VehicleModel.create({
    name: 'Model H',
    slug: 'model-h',
    brand: 'DriveX',
    category: 'SUV',
    tagline: 'Bold Luxury & Intelligent All-Terrain Dominance',
    description:
      'The DriveX Model H combines aerodynamic sophistication with robust SUV engineering. Powered by a responsive 1.5L turbocharged powertrain, panoramic glass roof, ADAS Level 2 active safety, and ventilated leatherette upholstery.',
    heroImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    ],
    startingPrice: 1085000,
    launchYear: 2026,
    isFeatured: true,
    isActive: true,
    specSummary: {
      engine: '1.5L Turbo Petrol VVT',
      power: '148 bhp @ 5,500 rpm',
      transmission: '7-Speed Dual Clutch / 6MT',
      mileage: '17.8 kmpl',
      bootSpace: '485 Litres',
      groundClearance: '205 mm',
    },
  });

  // Client sample data requirement:
  // Stock ID: NEW-H-02, Model: Model H, Variant: ZX automatic, Fuel: Petrol, Year: 2026, Ex-showroom: ₹12,45,000
  const variantH_ZX = await VehicleVariant.create({
    modelId: modelH._id,
    name: 'ZX automatic',
    variantCode: 'H-ZX-AT',
    stockId: 'NEW-H-02',
    slug: 'model-h-zx-automatic',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    exShowroomPrice: 1245000,
    engineCapacityCc: 1498,
    powerBhp: 148,
    torqueNm: 250,
    mileageKmpl: 17.8,
    seatingCapacity: 5,
    colors: [
      { name: 'Imperial Blue', hex: '#1E3A8A' },
      { name: 'Onyx Black', hex: '#0F172A' },
      { name: 'Pearl White', hex: '#F8FAFC' },
      { name: 'Crimson Red', hex: '#BE123C' },
    ],
    features: [
      'Panoramic Dual-Pane Sunroof',
      '10.25-inch Touchscreen with Wireless CarPlay & Android Auto',
      'ADAS Level 2 Autonomous Emergency Braking',
      '6 Airbags Standard & ESP',
      'Ventilated Front Seats with Electric Adjustment',
      '360-Degree Surround HD Camera',
    ],
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    ],
    isAvailable: true,
    stockCount: 8,
  });

  const variantH_EX = await VehicleVariant.create({
    modelId: modelH._id,
    name: 'EX manual',
    variantCode: 'H-EX-MT',
    stockId: 'NEW-H-01',
    slug: 'model-h-ex-manual',
    fuelType: 'Petrol',
    transmission: 'Manual',
    exShowroomPrice: 1085000,
    engineCapacityCc: 1498,
    powerBhp: 148,
    torqueNm: 250,
    mileageKmpl: 18.5,
    seatingCapacity: 5,
    colors: [
      { name: 'Pearl White', hex: '#F8FAFC' },
      { name: 'Steel Grey', hex: '#64748B' },
    ],
    features: [
      '8-inch Touchscreen Infotainment',
      'Push Button Start / Stop',
      'Cruise Control',
      'Reverse Parking Camera with Sensors',
    ],
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'],
    isAvailable: true,
    stockCount: 5,
  });

  // Additional New Models
  const modelE = await VehicleModel.create({
    name: 'Model E',
    slug: 'model-e',
    brand: 'DriveX',
    category: 'Sedan',
    tagline: 'Pure Executive Elegance & Aerodynamic Luxury',
    description:
      'Engineered for discerning professionals, the Model E delivers whisper-quiet cabin acoustics, class-leading rear legroom, crafted wood veneer trim, and an ultra-refined 1.5L turbocharged engine.',
    heroImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    ],
    startingPrice: 1560000,
    launchYear: 2026,
    isFeatured: true,
    isActive: true,
    specSummary: {
      engine: '1.5L VTEC Turbo',
      power: '176 bhp @ 6,000 rpm',
      transmission: 'CVT with Paddle Shifters',
      mileage: '19.2 kmpl',
      bootSpace: '510 Litres',
      groundClearance: '165 mm',
    },
  });

  const variantE_VX = await VehicleVariant.create({
    modelId: modelE._id,
    name: 'VX CVT',
    variantCode: 'E-VX-CVT',
    stockId: 'NEW-E-01',
    slug: 'model-e-vx-cvt',
    fuelType: 'Petrol',
    transmission: 'CVT',
    exShowroomPrice: 1560000,
    engineCapacityCc: 1498,
    powerBhp: 176,
    torqueNm: 240,
    mileageKmpl: 19.2,
    seatingCapacity: 5,
    colors: [
      { name: 'Crystal Black', hex: '#0B1120' },
      { name: 'Lunar Silver', hex: '#CBD5E1' },
      { name: 'Radiant Red', hex: '#BE123C' },
    ],
    features: ['Electric Sunroof', 'LaneWatch Blindspot Camera', 'Wireless Charger', 'Ambient Lighting'],
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'],
    isAvailable: true,
    stockCount: 4,
  });

  const modelV = await VehicleModel.create({
    name: 'Model V EV',
    slug: 'model-v-ev',
    brand: 'DriveX',
    category: 'Electric',
    tagline: 'Zero Emission Electrification with 480km Real-World Range',
    description:
      'The premier electric crossover designed for sustainable urban mobility with rapid 10%-80% DC fast charging in 32 minutes.',
    heroImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    ],
    startingPrice: 1720000,
    launchYear: 2026,
    isFeatured: true,
    isActive: true,
    specSummary: {
      engine: 'Permanent Magnet Synchronous Motor',
      power: '180 kW (241 bhp)',
      transmission: 'Single-Speed Automatic',
      mileage: '480 km per charge',
      bootSpace: '430 Litres',
      groundClearance: '185 mm',
    },
  });

  await VehicleVariant.create({
    modelId: modelV._id,
    name: 'Long Range EV',
    variantCode: 'V-EV-LR',
    stockId: 'NEW-V-01',
    slug: 'model-v-long-range-ev',
    fuelType: 'Electric',
    transmission: 'Automatic',
    exShowroomPrice: 1720000,
    engineCapacityCc: 0,
    powerBhp: 241,
    torqueNm: 350,
    mileageKmpl: 0,
    seatingCapacity: 5,
    colors: [
      { name: 'Electric Turquoise', hex: '#06B6D4' },
      { name: 'Glacier White', hex: '#F8FAFC' },
    ],
    features: ['60 kWh Liquid-Cooled LFP Battery Pack', 'Vehicle-to-Load (V2L) Power Outlet', 'Regenerative Braking Paddle Controls'],
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'],
    isAvailable: true,
    stockCount: 6,
  });

  console.log('[Seed] Seeding Dynamic City Pricing Records...');
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await CityPricing.create([
    {
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      vehicleModelId: modelH._id,
      vehicleVariantId: variantH_ZX._id,
      exShowroomPrice: 1245000,
      rtoRoadTax: 124500, // 10% UP RTO demo
      insurance: 56025, // 1-year comp + 3-year third party
      tcsAmount: 12450, // 1% TCS above 10 Lakh
      mandatoryAccessories: 14500,
      registrationAndFastag: 2500,
      offersDiscount: 25000, // Current festive saving
      priceValidityDate: nextMonth,
      disclaimer:
        'Demonstration Lucknow on-road estimate for simulation purposes only. Final registration tax, insurance, and cess are determined by Lucknow RTO and insurer at the time of final invoicing.',
      isActive: true,
    },
    {
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      vehicleModelId: modelH._id,
      vehicleVariantId: variantH_ZX._id,
      exShowroomPrice: 1245000,
      rtoRoadTax: 124500,
      insurance: 54800,
      tcsAmount: 12450,
      mandatoryAccessories: 12000,
      registrationAndFastag: 2500,
      offersDiscount: 20000,
      priceValidityDate: nextMonth,
      disclaimer:
        'Demonstration Kanpur on-road estimate for simulation purposes only. Final road tax and statutory fees are determined by Kanpur RTO.',
      isActive: true,
    },
    {
      city: 'Ayodhya',
      state: 'Uttar Pradesh',
      vehicleModelId: modelH._id,
      vehicleVariantId: variantH_ZX._id,
      exShowroomPrice: 1245000,
      rtoRoadTax: 124500,
      insurance: 53200,
      tcsAmount: 12450,
      mandatoryAccessories: 10000,
      registrationAndFastag: 2500,
      offersDiscount: 15000,
      priceValidityDate: nextMonth,
      disclaimer:
        'Demonstration Ayodhya on-road estimate for simulation purposes only.',
      isActive: true,
    },
    {
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      vehicleModelId: modelE._id,
      vehicleVariantId: variantE_VX._id,
      exShowroomPrice: 1560000,
      rtoRoadTax: 156000,
      insurance: 68500,
      tcsAmount: 15600,
      mandatoryAccessories: 18000,
      registrationAndFastag: 2500,
      offersDiscount: 35000,
      priceValidityDate: nextMonth,
      disclaimer:
        'Demonstration Lucknow on-road estimate for simulation purposes only.',
      isActive: true,
    },
  ]);

  console.log('[Seed] Seeding Certified Used Vehicles (Mandatory Sample Data)...');
  // Sample Data Requirements:
  // Stock ID: UC-1182, Model: Model C, Variant: VX, Fuel: Diesel, Year: 2022, KM: 41,200, Price: ₹8,45,000, Status: Available
  // Stock ID: UC-1190, Model: Model S, Variant: LX, Fuel: Petrol, Year: 2021, KM: 58,600, Price: ₹5,12,000, Status: Booked
  try {
    await UsedVehicle.create([
      {
        stockId: 'UC-1182',
      model: 'Model C',
      variant: 'VX',
      year: 2022,
      fuelType: 'Diesel',
      transmission: 'Manual',
      kilometres: 41200,
      previousOwners: 1,
      registrationNumber: 'UP32AB1234', // Full registration stored securely, masked in public APIs!
      askingPrice: 845000,
      color: 'Titanium Grey',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      ],
      showroomId: knpShowroom._id,
      status: 'Available',
      inspectionReport: {
        rating: 4.8,
        pointsInspected: 150,
        accidentFree: true,
        tyresCondition: '85% Tread Life Remaining (Bridgestone)',
        batteryCondition: 'Tested Healthy - 12.6V Output',
        engineCondition: 'Certified Excellent - Full Dealer Service History',
        bodyCondition: 'Original Paint - Zero Structural Damage',
        certifiedBy: 'DriveX Master Inspector, Lucknow',
        inspectionDate: new Date('2026-10-15'),
      },
      isFeatured: true,
      suggestedPriceBand: {
        min: 810000,
        max: 870000,
        median: 840000,
        sampleSize: 18,
      },
    },
    {
      stockId: 'UC-1190',
      model: 'Model S',
      variant: 'LX',
      year: 2021,
      fuelType: 'Petrol',
      transmission: 'Manual',
      kilometres: 58600,
      previousOwners: 1,
      registrationNumber: 'UP32CD5678', // Full registration stored securely, masked in public APIs!
      askingPrice: 512000,
      color: 'Arctic White',
      images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
      ],
      showroomId: knpShowroom._id,
      status: 'Booked',
      inspectionReport: {
        rating: 4.5,
        pointsInspected: 150,
        accidentFree: true,
        tyresCondition: '70% Tread Life (Good)',
        batteryCondition: 'Replaced Jan 2025 (Warranty Valid)',
        engineCondition: 'Smooth Idling - Clean Emission Check',
        bodyCondition: 'Minor bumper scuff touched up with OEM paint',
        certifiedBy: 'DriveX Master Inspector, Lucknow',
        inspectionDate: new Date('2026-09-28'),
      },
      isFeatured: false,
      suggestedPriceBand: {
        min: 490000,
        max: 535000,
        median: 515000,
        sampleSize: 24,
      },
    },
    {
      stockId: 'UC-1205',
      model: 'Model H',
      variant: 'EX',
      year: 2024,
      fuelType: 'Petrol',
      transmission: 'Manual',
      kilometres: 18400,
      previousOwners: 1,
      registrationNumber: 'UP32EF9012',
      askingPrice: 980000,
      color: 'Imperial Blue',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      ],
      showroomId: hzgShowroom._id,
      status: 'Available',
      inspectionReport: {
        rating: 4.9,
        pointsInspected: 150,
        accidentFree: true,
        tyresCondition: '92% Tread Life',
        batteryCondition: 'Factory Original OEM',
        engineCondition: 'Like New Condition',
        bodyCondition: 'Immaculate Exterior',
        certifiedBy: 'DriveX Certified Lab',
        inspectionDate: new Date('2026-10-20'),
      },
      isFeatured: true,
      suggestedPriceBand: {
        min: 940000,
        max: 1010000,
        median: 975000,
        sampleSize: 12,
      },
    },
    {
      stockId: 'UC-1218',
      model: 'Model E',
      variant: 'VX CVT',
      year: 2023,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      kilometres: 31000,
      previousOwners: 1,
      registrationNumber: 'UP32GH3456',
      askingPrice: 1220000,
      color: 'Crystal Black',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      ],
      showroomId: gmnShowroom._id,
      status: 'Available',
      inspectionReport: {
        rating: 4.7,
        pointsInspected: 150,
        accidentFree: true,
        tyresCondition: '78% Tread Life',
        batteryCondition: 'Optimal',
        engineCondition: 'Certified Clean - Full Synthetic Lubed',
        bodyCondition: 'Original Paint with Ceramic Coating',
        certifiedBy: 'DriveX Certified Lab',
        inspectionDate: new Date('2026-10-10'),
      },
      isFeatured: false,
      suggestedPriceBand: {
        min: 1180000,
        max: 1250000,
        median: 1215000,
      },
    },
  ]);
  } catch (usedVehicleErr: any) {
    console.error('[Seed Error] Failed to seed UsedVehicle:', JSON.stringify(usedVehicleErr.errors || usedVehicleErr));
    throw usedVehicleErr;
  }

  console.log('[Seed] Seeding Demo Vehicles & Test Drive Records...');
  await DemoVehicle.create([
    {
      showroomId: hzgShowroom._id,
      vehicleModelId: modelH._id,
      vehicleVariantId: variantH_ZX._id,
      registrationNumber: 'UP32-DEMO-01',
      isAvailable: true,
    },
    {
      showroomId: gmnShowroom._id,
      vehicleModelId: modelH._id,
      vehicleVariantId: variantH_ZX._id,
      registrationNumber: 'UP32-DEMO-02',
      isAvailable: true,
    },
  ]);

  // Seed sample Test Drive Bookings
  await TestDriveBooking.create([
    {
      bookingReference: 'TD-2026-8812',
      customerId: buyerUser._id,
      customerName: 'Vikram Malhotra',
      customerPhone: '+91 94150 99881',
      customerEmail: 'customer@drivex.in',
      vehicleModelId: modelH._id,
      vehicleVariantId: variantH_ZX._id,
      showroomId: hzgShowroom._id,
      bookingDate: '2026-11-05',
      timeSlot: '11:30 AM - 12:30 PM',
      status: 'CONFIRMED',
      consultantId: rohitUser._id,
      notes: 'Customer specifically requested checking rear seat legroom and boot capacity.',
    },
  ]);

  console.log('[Seed] Seeding Sample Leads with SLA Timers & AI Summaries...');
  const now = new Date();
  await Lead.create([
    {
      leadNumber: 'LD-2026-7701',
      customerName: 'Ananya Gupta',
      email: 'ananya.gupta@gmail.com',
      phone: '+91 98765 43210',
      consentGiven: true,
      consentTimestamp: new Date(now.getTime() - 120000), // 2 mins ago
      consentPurpose: 'Authorized vehicle enquiry communication',
      optOutCommunications: false,
      source: 'WEBSITE',
      status: 'ASSIGNED',
      preferredModelId: modelH._id,
      preferredVariantId: variantH_ZX._id,
      preferredShowroomId: hzgShowroom._id,
      assignedConsultantId: rohitUser._id,
      assignedAt: new Date(now.getTime() - 120000),
      responseDueAt: new Date(now.getTime() + 180000), // 3 mins remaining on 5m SLA!
      budgetRange: '₹12 Lakh - ₹15 Lakh',
      fuelPreference: 'Petrol',
      transmissionPreference: 'Automatic',
      purchaseTimeline: 'Within 2 weeks',
      customerNotes: 'Looking for a reliable automatic family SUV with sunroof. Would like to test drive this Saturday.',
      pricingSnapshot: {
        variantName: 'ZX automatic',
        exShowroomPrice: 1245000,
        city: 'Lucknow',
        totalOnRoadPrice: 1416975,
      },
      aiSummary: {
        content:
          'Customer Ananya Gupta is looking for a petrol automatic SUV (Model H ZX) within ₹12-15L budget for family use with sunroof, targeting delivery in 2 weeks and prefers a Saturday test drive.',
        status: 'GENERATED',
        generatedAt: now,
        modelUsed: 'gemini-1.5-flash',
      },
      aiFirstReplyDraft: {
        content: `Dear Ananya,

Thank you for your interest in the DriveX Model H ZX automatic at our Hazratganj showroom.

I would be delighted to arrange a dedicated test drive for you this Saturday and showcase the panoramic sunroof and smart features.

Would morning 11:00 AM or afternoon 3:00 PM suit you better?

Warm regards,
Rohit Sharma
DriveX Lucknow`,
        status: 'GENERATED',
        generatedAt: now,
        lastEditedContent: `Dear Ananya,

Thank you for your interest in the DriveX Model H ZX automatic at our Hazratganj showroom.

I would be delighted to arrange a dedicated test drive for you this Saturday and showcase the panoramic sunroof and smart features.

Would morning 11:00 AM or afternoon 3:00 PM suit you better?

Warm regards,
Rohit Sharma
DriveX Lucknow`,
        isCustomized: false,
      },
      activityTimeline: [
        {
          action: 'LEAD_CREATED',
          note: 'Submitted through website Model H detail page.',
          timestamp: new Date(now.getTime() - 120000),
        },
        {
          action: 'LEAD_ASSIGNED',
          performedByName: 'DriveX Auto-Assignment Engine',
          note: 'Assigned to Rohit Sharma (Hazratganj Showroom, workload balanced).',
          timestamp: new Date(now.getTime() - 120000),
        },
      ],
    },
    {
      leadNumber: 'LD-2026-7702',
      customerName: 'Suresh Chandra',
      email: 'suresh.chandra@outlook.com',
      phone: '+91 94151 22334',
      consentGiven: true,
      consentTimestamp: new Date(now.getTime() - 900000),
      consentPurpose: 'Authorized vehicle enquiry communication',
      optOutCommunications: false,
      source: 'WALK_IN',
      status: 'CONTACTED',
      preferredModelId: modelE._id,
      preferredVariantId: variantE_VX._id,
      preferredShowroomId: gmnShowroom._id,
      assignedConsultantId: amitUser._id,
      assignedAt: new Date(now.getTime() - 900000),
      firstContactedAt: new Date(now.getTime() - 720000),
      responseTimeSeconds: 180, // 3 minutes response!
      budgetRange: '₹15 Lakh - ₹18 Lakh',
      fuelPreference: 'Petrol',
      transmissionPreference: 'CVT',
      purchaseTimeline: 'Immediate',
      customerNotes: 'Walk-in enquiry at Gomti Nagar. Interested in Model E executive sedan.',
      aiSummary: {
        content:
          'Walk-in customer Suresh Chandra interested in Model E VX CVT sedan with immediate purchase intent within ₹15-18L budget.',
        status: 'GENERATED',
        generatedAt: now,
      },
      aiFirstReplyDraft: {
        content: 'Customer already met at Gomti Nagar showroom. Quotation shared.',
        status: 'GENERATED',
        generatedAt: now,
        isCustomized: true,
      },
      activityTimeline: [
        {
          action: 'LEAD_CREATED',
          note: 'Recorded walk-in at Gomti Nagar.',
          timestamp: new Date(now.getTime() - 900000),
        },
        {
          action: 'STATUS_CHANGED_CONTACTED',
          performedByName: 'Amit Singh',
          note: 'Met customer in person and handed over vehicle brochure and quotation.',
          timestamp: new Date(now.getTime() - 720000),
        },
      ],
    },
  ]);

  console.log('[Seed] Database seeding completed successfully!');
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase(true);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Fatal seeding error:', err);
      process.exit(1);
    }
  })();
}
