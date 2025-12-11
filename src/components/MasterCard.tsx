import { motion } from 'framer-motion'
import { useState } from 'react'
import { type Service } from '../types'
import SlotModal from './SlotModal'
import api from '../services/api'

interface MasterCardProps {
  service: Service
}

export default function MasterCard({ service }: MasterCardProps) {
  const [showMasters, setShowMasters] = useState(false)
  const [masters, setMasters] = useState<any[]>([])
  const [selectedMaster, setSelectedMaster] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleServiceClick = async () => {
    if (!showMasters) {
      setLoading(true)
      try {
        const data = await api.getMastersByService(service.id)
        setMasters(data)
        setShowMasters(true)
      } catch (error) {
        console.error('Error loading masters:', error)
      } finally {
        setLoading(false)
      }
    } else {
      setShowMasters(false)
    }
  }

  const handleMasterSelect = (master: any) => {
    setSelectedMaster({
      id: master.id,
      name: master.name,
      serviceId: service.id,
      serviceName: service.name,
      price: master.custom_price || master.default_price
    })
  }

  const formatRating = (rating: any) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
      return 'Нет оценок'
    }
    return `${Number(rating).toFixed(1)}/5`
  }

  return (
      <>
        <div className="relative mx-auto w-full">
          <div
              onClick={handleServiceClick}
              className="cursor-pointer relative inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full"
          >
            <div className="shadow p-4 rounded-lg bg-white">
              <div className="flex justify-center relative rounded-lg overflow-hidden h-52">
                <div className="transition-transform duration-500 transform ease-in-out hover:scale-110 w-full">
                  <img src={service.image_url || '/placeholder.jpg'} className="w-full h-full object-cover" alt={service.name} />
                </div>
              </div>

              <div className="mt-4">
                <h2 className="font-medium text-base md:text-lg text-gray-800 line-clamp-1">
                  {service.name}
                </h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-500">
                  {service.masters_count || 0} мастеров
                </p>
                <p className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
                  <span className="text-sm">от</span>
                  <span className="text-lg ml-1">{service.price} ₽</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {showMasters && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="font-semibold mb-3">Выберите мастера:</h3>
              {loading ? (
                  <p>Загрузка...</p>
              ) : (
                  <div className="space-y-2">
                    {masters.map(master => (
                        <div
                            key={master.id}
                            onClick={() => handleMasterSelect(master)}
                            className="p-3 bg-white rounded cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{master.name}</p>
                            <p className="text-sm text-gray-500">
                              Рейтинг: {formatRating(master.rating)}
                            </p>
                          </div>
                          <p className="font-semibold">{master.custom_price || master.default_price} ₽</p>
                        </div>
                    ))}
                  </div>
              )}
            </motion.div>
        )}

        {selectedMaster && (
            <SlotModal
                master={selectedMaster}
                onClose={() => setSelectedMaster(null)}
            />
        )}
      </>
  )
}