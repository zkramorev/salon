import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import MasterList from '../components/MasterList'
import ClientBookings from '../components/ClientBookings'
import Notifications from '../components/Notifications'

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('services')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
      <>
        <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><title>Beautyxt SVG Icon</title><rect width="27" height="39" x="9.676" y="4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" rx="3" ry="3"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M15.574 12.409h15.341m-15.341 4.206h15.341m-15.341 4.206h15.341m-15.341 4.206h13.909m-13.909 4.206h11.608m3.809-2.889l9.333-9.333"/></svg>
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Booking System</span>
            </a>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 rounded ${activeTab === 'services' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Услуги
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`px-4 py-2 rounded ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Мои записи
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 rounded ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Уведомления
                </button>
              </div>

              <button
                  onClick={handleLogout}
                  className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2"
              >
                Выйти
              </button>
            </div>
          </div>
        </nav>

        <div className="pt-16">
          {activeTab === 'services' && <MasterList />}
          {activeTab === 'bookings' && (
              <div className="container mx-auto px-4 py-8">
                <ClientBookings />
              </div>
          )}
          {activeTab === 'notifications' && (
              <div className="container mx-auto px-4 py-8">
                <Notifications />
              </div>
          )}
        </div>
      </>
  )
}