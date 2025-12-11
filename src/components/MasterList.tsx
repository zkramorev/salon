import { useState, useEffect } from 'react'
import MasterCard from './MasterCard'
import api from '../services/api'
import { type Service } from '../types'

export default function MasterList() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await api.getServices()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка услуг...</div>
        </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Выберите услугу</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map(service => (
              <MasterCard key={service.id} service={service} />
          ))}
        </div>
      </div>
  )
}