import { useState, useEffect } from 'react'
import api from '../services/api'

interface Props {
  masterId: string
}

export default function ScheduleWidget({ masterId }: Props) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    duration: 60
  })

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

  const handleConfirm = async (bookingId: string) => {
    try {
      await api.confirmBooking(bookingId)
      alert('Запись подтверждена')
      loadBookings()
    } catch (error) {
      alert('Ошибка при подтверждении записи')
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (confirm('Вы уверены, что хотите отменить запись?')) {
      try {
        await api.cancelBooking(bookingId)
        alert('Запись отменена')
        loadBookings()
      } catch (error) {
        alert('Ошибка при отмене записи')
      }
    }
  }

  const handleAddSlots = async () => {
    try {
      await api.createSlots(slotForm)
      alert('Слоты успешно созданы')
      setShowAddSlot(false)
    } catch (error) {
      alert('Ошибка при создании слотов')
    }
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>
  }

  return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Мое расписание</h1>
          <button
              onClick={() => setShowAddSlot(!showAddSlot)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Добавить слоты
          </button>
        </div>

        {showAddSlot && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Создание слотов</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Дата</label>
                  <input
                      type="date"
                      value={slotForm.date}
                      onChange={(e) => setSlotForm({...slotForm, date: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Длительность (мин)</label>
                  <input
                      type="number"
                      value={slotForm.duration}
                      onChange={(e) => setSlotForm({...slotForm, duration: parseInt(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Начало</label>
                  <input
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm({...slotForm, startTime: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Конец</label>
                  <input
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm({...slotForm, endTime: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
              <button
                  onClick={handleAddSlots}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Создать слоты
              </button>
            </div>
        )}

        <div className="space-y-4">
          {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Нет записей</p>
          ) : (
              bookings.map((booking) => (
                  <div key={booking.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                    <div className="flex gap-4">
                      <img
                          src={`https://ui-avatars.com/api/?name=${booking.client_name}&background=random`}
                          className="w-12 h-12 rounded-full"
                          alt={booking.client_name}
                      />
                      <div>
                        <p className="font-medium">{booking.client_name}</p>
                        <p className="text-sm text-gray-600">{booking.service_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString('ru-RU')} в {booking.start_time.slice(0, 5)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                          <button
                              onClick={() => handleConfirm(booking.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Подтвердить
                          </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                              onClick={() => handleCancel(booking.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Отменить
                          </button>
                      )}
                    </div>
                  </div>
              ))
          )}
        </div>
      </div>
  )
}