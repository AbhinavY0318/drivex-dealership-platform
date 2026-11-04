import {
  User,
  VehicleModel,
  VehicleVariant,
  CityPricingResult,
  EMICalculationResult,
  UsedVehicle,
  Lead,
  LeadAnalytics,
  TestDriveBooking,
  Showroom,
} from '../types/index.js';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data: T; meta?: any }> {
  const token = localStorage.getItem('drivex_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Network request failed');
  }

  return data;
}

export const api = {
  // --- AUTH ---
  auth: {
    register: (payload: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    getMe: () => request<User>('/auth/me'),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
  },

  // --- VEHICLES & PRICING ---
  vehicles: {
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      return request<VehicleModel[]>(`/vehicles?${query}`);
    },
    getBySlug: (slug: string) => request<{ model: VehicleModel; variants: VehicleVariant[] }>(`/vehicles/${slug}`),
    getPricing: (variantId: string, city: string = 'Lucknow') =>
      request<CityPricingResult>(`/vehicles/variant/${variantId}/pricing?city=${encodeURIComponent(city)}`),
    calculateEMI: (payload: { onRoadPrice: number; downPayment: number; annualInterestRate: number; tenureMonths: number }) =>
      request<EMICalculationResult>('/vehicles/emi-calculator', { method: 'POST', body: JSON.stringify(payload) }),
  },

  // --- CERTIFIED USED VEHICLES ---
  usedVehicles: {
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      return request<UsedVehicle[]>(`/used-vehicles?${query}`);
    },
    getById: (id: string) => request<UsedVehicle>(`/used-vehicles/${id}`),
    getPriceSuggestion: (id: string) => request<any>(`/used-vehicles/${id}/price-suggestion`),
  },

  // --- LEADS & CRM ---
  leads: {
    create: (payload: any) => request<any>('/leads', { method: 'POST', body: JSON.stringify(payload) }),
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      return request<Lead[]>(`/leads?${query}`);
    },
    getById: (id: string) => request<Lead>(`/leads/${id}`),
    updateStatus: (id: string, status: string, note?: string) =>
      request<Lead>(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
    reassign: (id: string, newConsultantId: string, reason: string) =>
      request<Lead>(`/leads/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ newConsultantId, reason }) }),
    updateDraft: (id: string, editedContent: string) =>
      request<any>(`/leads/${id}/ai-draft`, { method: 'PATCH', body: JSON.stringify({ editedContent }) }),
    regenerateDraft: (id: string) =>
      request<any>(`/leads/${id}/ai-draft/regenerate`, { method: 'POST' }),
    getAnalytics: () => request<LeadAnalytics>('/leads/analytics'),
  },

  // --- TEST DRIVES ---
  testDrives: {
    getAvailability: (showroomId: string, vehicleModelId: string, date: string) =>
      request<{ timeSlot: string; isAvailable: boolean }[]>(
        `/test-drives/availability?showroomId=${showroomId}&vehicleModelId=${vehicleModelId}&date=${date}`
      ),
    book: (payload: any) => request<TestDriveBooking>('/test-drives', { method: 'POST', body: JSON.stringify(payload) }),
    getMyBookings: () => request<TestDriveBooking[]>('/test-drives/my-bookings'),
    getConsultantBookings: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      return request<TestDriveBooking[]>(`/test-drives/consultant-bookings?${query}`);
    },
    updateStatus: (id: string, status: string, cancellationReason?: string) =>
      request<TestDriveBooking>(`/test-drives/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, cancellationReason }),
      }),
  },

  // --- SHOWROOMS ---
  showrooms: {
    getAll: () => request<Showroom[]>('/showrooms'),
    getById: (id: string) => request<Showroom>(`/showrooms/${id}`),
  },

  // --- ADMIN CMS ---
  admin: {
    createModel: (payload: any) => request<VehicleModel>('/admin/vehicles', { method: 'POST', body: JSON.stringify(payload) }),
    updateModel: (id: string, payload: any) => request<VehicleModel>(`/admin/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    createVariant: (payload: any) => request<VehicleVariant>('/admin/variants', { method: 'POST', body: JSON.stringify(payload) }),
    updateVariant: (id: string, payload: any) => request<VehicleVariant>(`/admin/variants/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getPricing: () => request<any[]>('/admin/pricing'),
    createPricing: (payload: any) => request<any>('/admin/pricing', { method: 'POST', body: JSON.stringify(payload) }),
    updatePricing: (id: string, payload: any) => request<any>(`/admin/pricing/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    createUsedVehicle: (payload: any) => request<UsedVehicle>('/admin/used-vehicles', { method: 'POST', body: JSON.stringify(payload) }),
    updateUsedVehicle: (id: string, payload: any) => request<UsedVehicle>(`/admin/used-vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getConsultants: () => request<User[]>('/admin/consultants'),
    createConsultant: (payload: any) => request<User>('/admin/consultants', { method: 'POST', body: JSON.stringify(payload) }),
    toggleAvailability: (id: string) => request<any>(`/admin/consultants/${id}/availability`, { method: 'PATCH' }),
    getAnalytics: () => request<any>('/admin/analytics'),
  },
};
