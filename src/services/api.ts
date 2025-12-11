const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API Error');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(userData: any) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.token = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  // Services
  async getServices() {
    return this.request('/services');
  }

  async getMastersByService(serviceId: number) {
    return this.request(`/services/${serviceId}/masters`);
  }

  // Slots
  async getMasterSlots(masterId: string, date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request(`/slots/master/${masterId}${query}`);
  }

  async createSlots(data: any) {
    return this.request('/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSlot(slotId: string) {
    return this.request(`/slots/${slotId}`, {
      method: 'DELETE',
    });
  }

  // Bookings
  async getMyBookings() {
    return this.request('/bookings/my');
  }

  async createBooking(data: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  async confirmBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/confirm`, {
      method: 'PUT',
    });
  }

  async rescheduleBooking(bookingId: string, newSlotId: string) {
    return this.request(`/bookings/${bookingId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ newSlotId }),
    });
  }

  // User
  async getProfile() {
    return this.request('/users/me');
  }

  async getStatistics(masterId?: string) {
    const query = masterId ? `?masterId=${masterId}` : '';
    return this.request(`/users/statistics${query}`);
  }

  async getNotifications() {
    return this.request('/users/notifications');
  }

  async markNotificationsAsRead(notificationIds: number[]) {
    return this.request('/users/notifications/read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });
  }
}

export default new ApiService();