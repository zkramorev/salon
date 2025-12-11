import { useState, useEffect } from 'react'
import api from '../services/api'

export default function ClientBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showReschedule, setShowReschedule] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const data = await api.getMyBookings()
      setBookings(data)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (confirm('Вы уверены, что хотите отменить запись?')) {
      try {
        await api.cancelBooking(bookingId)
        alert('Запись успешно отменена')
        loadBookings()
      } catch (error: any) {
        alert(error.message || 'Ошибка при отмене записи')
      }
    }
  }

  const handleReschedule = async (bookingId: string, masterId: string) => {
    setShowReschedule(bookingId)
    try {
      const slots = await api.getMasterSlots(masterId)
      setAvailableSlots(slots.filter((s: any) => s.is_available))
    } catch (error) {
      console.error('Error loading slots:', error)
    }
  }

  const confirmReschedule = async (bookingId: string, newSlotId: string) => {
    try {
      await api.rescheduleBooking(bookingId, newSlotId)
      alert('Запись успешно перенесена')
      setShowReschedule(null)
      loadBookings()
    } catch (error: any) {
      alert(error.message || 'Ошибка при переносе записи')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      pending: { text: 'Ожидает подтверждения', class: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Подтверждено', class: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Отменено', class: 'bg-red-100 text-red-800' },
      completed: { text: 'Завершено', class: 'bg-gray-100 text-gray-800' }
    }
    const statusInfo = statusMap[status] || { text: status, class: 'bg-gray-100' }

    return (
        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка записей...</div>
  }

  if (bookings.length === 0) {
    return (
        <div className="text-center py-8">
          <p className="text-gray-500">У вас пока нет записей</p>
        </div>
    )
  }

  return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Мои записи</h2>
        {bookings.map(booking => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{booking.service_name}</h3>
                  <p className="text-sm text-gray-600">Мастер: {booking.master_name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.date).toLocaleDateString('ru-RU')} в {booking.start_time.slice(0, 5)}
                  </p>
                  <p className="text-sm font-medium mt-1">{booking.price} ₽</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(booking.status)}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <div className="flex gap-2">
                        <button
                            onClick={() => handleReschedule(booking.id, booking.master_id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Перенести
                        </button>
                        <button
                            onClick={() => handleCancel(booking.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                          Отменить
                        </button>
                      </div>
                  )}
                </div>
              </div>

              {showReschedule === booking.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">Выберите новое время:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(slot => (
                          <button
                              key={slot.id}
                              onClick={() => confirmReschedule(booking.id, slot.id)}
                              className="p-2 text-sm border rounded hover:bg-blue-50"
                          >
                            {new Date(slot.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} {slot.start_time.slice(0, 5)}
                          </button>
                      ))}
                    </div>
                    <button
                        onClick={() => setShowReschedule(null)}
                        className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Отмена
                    </button>
                  </div>
              )}
            </div>
        ))}
      </div>
  )
}