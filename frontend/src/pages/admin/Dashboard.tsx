import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Users,
  Car,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8.2%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Parking Spots',
      value: '156',
      change: '+3',
      icon: Car,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Occupancy Rate',
      value: '78%',
      change: '+5.1%',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const revenueData = [
    { name: 'Jan', revenue: 4000, bookings: 240 },
    { name: 'Feb', revenue: 3000, bookings: 198 },
    { name: 'Mar', revenue: 5000, bookings: 310 },
    { name: 'Apr', revenue: 4500, bookings: 280 },
    { name: 'May', revenue: 6000, bookings: 380 },
    { name: 'Jun', revenue: 5500, bookings: 340 },
  ];

  const occupancyData = [
    { hour: '00:00', rate: 20 },
    { hour: '03:00', rate: 15 },
    { hour: '06:00', rate: 45 },
    { hour: '09:00', rate: 85 },
    { hour: '12:00', rate: 90 },
    { hour: '15:00', rate: 75 },
    { hour: '18:00', rate: 95 },
    { hour: '21:00', rate: 60 },
  ];

  const recentBookings = [
    { id: 1, user: 'John Doe', parking: 'Downtown A', time: '2 mins ago' },
    { id: 2, user: 'Jane Smith', parking: 'Mall B', time: '5 mins ago' },
    { id: 3, user: 'Mike Johnson', parking: 'Airport C', time: '12 mins ago' },
    { id: 4, user: 'Sarah Williams', parking: 'Downtown A', time: '18 mins ago' },
    { id: 5, user: 'Tom Brown', parking: 'Station D', time: '25 mins ago' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardTitle className="mb-6">Revenue Overview</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Occupancy Chart */}
        <Card>
          <CardTitle className="mb-6">Occupancy Rate (Today)</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardTitle className="mb-6">Recent Bookings</CardTitle>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between pb-4 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{booking.user}</p>
                  <p className="text-sm text-gray-600">{booking.parking}</p>
                </div>
                <span className="text-sm text-gray-500">{booking.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Parking Status */}
        <Card>
          <CardTitle className="mb-6">Parking Status</CardTitle>
          <div className="space-y-4">
            {['Downtown A', 'Mall B', 'Airport C', 'Station D'].map((parking) => (
              <div key={parking} className="pb-4 border-b last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{parking}</span>
                  <span className="text-sm text-gray-600">45/50 occupied</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: '90%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
