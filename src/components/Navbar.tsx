import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><title>Ru SVG Icon</title><mask id="circleFlagsRu0"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#circleFlagsRu0)"><path fill="#0052b4" d="M512 170v172l-256 32L0 342V170l256-32z"/><path fill="#eee" d="M512 0v170H0V0Z"/><path fill="#d80027" d="M512 342v170H0V342Z"/></g></svg>
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">СВО</span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button onClick={handleLogout} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">На выход сучки</button>
          </div>
        </div>
    </nav>
  );
}