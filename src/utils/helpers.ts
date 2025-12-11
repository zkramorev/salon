// src/utils/helpers.ts
import { type Slot, type Booking } from '../types'
import { getMockSlots } from '../data/mockData'

const SLOTS_KEY = 'slots'
const BOOKINGS_KEY = 'bookings'

export const getSlots = (): Slot[] => {
  return getMockSlots();
  const saved = localStorage.getItem(SLOTS_KEY)
  return saved ? JSON.parse(saved) : getMockSlots()
}

export const saveSlots = (slots: Slot[]) => {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
}

export const getSlotsByMaster = (masterId: string): Slot[] => {
  return getSlots().filter(s => s.masterId === masterId)
}

export const addSlot = (masterId: string, date: string, time: string) => {
  const slots = getSlots()
  const newSlot: Slot = {
    id: Date.now().toString(),
    masterId,
    date,
    time,
    isBooked: false
  }
  slots.push(newSlot)
  saveSlots(slots)
}

export const deleteSlot = (slotId: string) => {
  const slots = getSlots().filter(s => s.id !== slotId)
  saveSlots(slots)
}

export const saveBooking = (clientId: string, masterId: string, slotId: string, date: string, time: string) => {
  const slots = getSlots()
  const slotIndex = slots.findIndex(s => s.id === slotId)
  if (slotIndex !== -1) {
    slots[slotIndex].isBooked = true
    slots[slotIndex].clientId = clientId
    saveSlots(slots)
  }

  const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]')
  bookings.push({ id: Date.now().toString(), clientId, masterId, slotId, date, time })
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}