import { useState, useEffect } from 'react'
import api from '../services/api'

export default function MasterStatistics() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const data = await api.getStatistics()
      setStats(data)
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка статистики...</div>
  }

  if (!stats) {
    return <div className="text-center py-4">Нет данных</div>
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Статистика</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Выполнено записей</h3>
            <p className="text-2xl font-bold text-green-600">{stats.general.completed_bookings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Общий доход</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.general.total_revenue} ₽</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Уникальных клиентов</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.general.unique_clients}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Популярные услуги</h3>
            <div className="space-y-2">
              {stats.popularServices.map((service: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{service.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium block">{service.bookings_count} записей</span>
                      <span className="text-xs text-gray-500">{service.revenue} ₽</span>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Загрузка по дням недели</h3>
            <div className="space-y-2">
              {stats.byWeekDay.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{day.day_name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(day.bookings_count / Math.max(...stats.byWeekDay.map((d: any) => d.bookings_count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{day.bookings_count}</span>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}