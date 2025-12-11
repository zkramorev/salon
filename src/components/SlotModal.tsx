import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import api from '../services/api'

interface Props {
  master: any
  onClose: () => void
}

export default function SlotModal({ master, onClose }: Props) {
  const [slots, setSlots] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    loadSlots()
  }, [selectedDate])

  const loadSlots = async () => {
    setLoading(true)
    try {
      const data = await api.getMasterSlots(master.id, selectedDate)
      setSlots(data.filter((slot: any) => slot.is_available))
    } catch (error) {
      console.error('Error loading slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (slot: any) => {
    setBooking(true)
    try {
      await api.createBooking({
        masterId: master.id,
        serviceId: master.serviceId,
        slotId: slot.id,
        notes: ''
      })
      alert(`Вы успешно записаны к ${master.name} на ${slot.date} ${slot.start_time}`)
      onClose()
      window.location.reload()
    } catch (error) {
      alert('Ошибка при создании записи')
    } finally {
      setBooking(false)
    }
  }

  // Генерация дат на неделю вперед
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Запись к {master.name}</h2>
              <p className="text-gray-600">{master.serviceName} - {master.price} ₽</p>
            </div>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите дату:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map(date => (
                  <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 rounded whitespace-nowrap ${
                          selectedDate === date
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    {new Date(date).toLocaleDateString('ru-RU', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Доступное время:</h3>
            {loading ? (
                <p className="text-center py-4">Загрузка...</p>
            ) : slots.length === 0 ? (
                <p className="text-center py-4 text-gray-500">Нет свободных слотов на эту дату</p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(slot => (
                      <motion.button
                          key={slot.id}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleBook(slot)}
                          disabled={booking}
                          className="p-3 border rounded hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50"
                      >
                        {slot.start_time.slice(0, 5)}
                      </motion.button>
                  ))}
                </div>
            )}
          </div>
        </motion.div>
      </div>
  )
}