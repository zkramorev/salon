import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(data)
      
      // Отмечаем непрочитанные как прочитанные
      const unreadIds = data.filter((n: any) => !n.is_read).map((n: any) => n.id)
      if (unreadIds.length > 0) {
        await api.markNotificationsAsRead(unreadIds)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_reminder':
        return '🔔'
      case 'booking_confirmed':
        return '✅'
      case 'booking_cancelled':
        return '❌'
      default:
        return '📢'
    }
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка уведомлений...</div>
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">У вас пока нет уведомлений</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Уведомления</h2>
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`bg-white p-4 rounded-lg shadow ${
            !notification.is_read ? 'border-l-4 border-blue-500' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
            <div className="flex-1">
              <h3 className="font-medium">{notification.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notification.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}