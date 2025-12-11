import { type User, type Slot } from '../types'

export const mockUsers: User[] = [
  { id: '1', login: 'client1@email.com', password: '123', role: 'client', name: 'Иван Иванов' },
  { id: '2', login: 'master1@email.com', password: '123', role: 'master', name: 'Анна Сидорова', position: 'Парикмахер', price: 2500 },
  { id: '3', login: 'master2@email.com', password: '123', role: 'master', name: 'Пётр Петров', position: 'Маникюр', price: 1800 },
]

export const getMockSlots = (): Slot[] => [
  { id: 's1', masterId: '2', date: '2025-04-10', time: '10:00', isBooked: false },
  { id: 's2', masterId: '2', date: '2025-04-10', time: '14:00', isBooked: true, clientId: '1' },
  { id: 's3', masterId: '3', date: '2025-04-11', time: '12:00', isBooked: false },
]

export const mockClients = [
  { id: 1, email: 'client1@email.com', password: '123', role: 'client', name: 'Иван', imageUrl: '/src/assets/nigger1.jpg', visit: { date: '🗓 9 Ноя', startTime: '10:00', endTime: '11:00' } },
  { id: 2, email: 'client2@email.com', password: '123', role: 'client', name: 'Lil Nigga', imageUrl: '/src/assets/nigger2.jpg', visit: { date: '🗓 9 Ноя', startTime: '12:00', endTime: '13:00' } },
  { id: 3, email: 'client3@email.com', password: '123', role: 'client', name: 'Саня', imageUrl: '/src/assets/nigger1.jpg', visit: { date: '🗓 9 Ноя', startTime: '15:00', endTime: '17:00' } },
  { id: 4, email: 'client4@email.com', password: '123', role: 'client', name: 'Петух', imageUrl: '/src/assets/nigger2.jpg', visit: { date: '🗓 9 Ноя', startTime: '18:00', endTime: '20:00' } },
];

export const mockService = [
  { id: 1, imageUrl: '/src/assets/service1.jpg', name: 'Женская стрижка', description: '', price: 122, masterName: 'master1', masterImageUrl: '' },
  { id: 2, imageUrl: '/src/assets/service2.jpg', name: 'Маникюр', description: '', price: 133, masterName: 'master2', masterImageUrl: '' },
  { id: 3, imageUrl: '/src/assets/service3.jpg', name: 'Мужская стрижка', description: '', price: 133, masterName: 'master3', masterImageUrl: '' },
  { id: 4, imageUrl: '/src/assets/service4.jpg', name: 'Депиляция пизды', description: '', price: 133, masterName: 'master4', masterImageUrl: '' },
  { id: 5, imageUrl: '/src/assets/service5.jpg', name: 'Уход за лицом', description: '', price: 133, masterName: 'master5', masterImageUrl: '' },
];