export type UserRole = 'client' | 'master' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
}

export interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
  image_url?: string
  masters_count?: number
}

export interface Slot {
  id: string
  master_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
}

export interface Booking {
  id: string
  client_id: string
  master_id: string
  service_id: string
  slot_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  price: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'booking_reminder' | 'booking_confirmed' | 'booking_cancelled'
  title: string
  message: string
  is_read: boolean
  created_at: string
}