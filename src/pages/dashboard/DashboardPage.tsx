import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface StatsData {
  totalIncome: number
  totalExpenses: number
  averageDaily: number
  comparisonPercentage: number | null
}

interface CategoryData {
  _id: string
  total: number
  name?: string
}

interface DailyData {
  _id: number
  total: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const name = data.payload.name || data.name || label
    const value = data.value
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">{name}: </span>
          <span style={{ color: data.color }} className="font-semibold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value)}
          </span>
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)
  const [heatmapTooltip, setHeatmapTooltip] = useState<{ day: number; amount: number; x: number; y: number } | null>(null)

  const fetchOverviewStats = async () => {
    try {
      const data = await api.getOverviewStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching overview stats:', error)
      toast.error('Không thể tải dữ liệu thống kê')
    }
  }

  const fetchCategoryStats = async () => {
    try {
      const data = await api.getCategoryStats()
      // Map _id to name for PieChart compatibility
      const mappedData = data.map(item => ({
        ...item,
        name: item._id
      }))
      setCategoryData(mappedData)
    } catch (error) {
      console.error('Error fetching category stats:', error)
      toast.error('Không thể tải dữ liệu danh mục')
    }
  }

  const fetchDailyStats = async () => {
    try {
      const data = await api.getDailyStats()
      setDailyData(data)
    } catch (error) {
      console.error('Error fetching daily stats:', error)
      toast.error('Không thể tải dữ liệu hàng ngày')
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchOverviewStats(),
          fetchCategoryStats(),
          fetchDailyStats()
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getHeatmapColor = (amount: number) => {
    if (amount === 0) return 'bg-gray-100'
    if (amount < 100000) return 'bg-green-200'
    if (amount < 300000) return 'bg-yellow-200'
    if (amount < 500000) return 'bg-orange-200'
    return 'bg-red-200'
  }

  const renderHeatmap = () => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()
    
    const heatmapData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dailyStat = dailyData.find(stat => stat._id === day)
      return {
        day,
        amount: dailyStat?.total || 0
      }
    })

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        <div className="text-xs text-center text-gray-500">CN</div>
        <div className="text-xs text-center text-gray-500">T2</div>
        <div className="text-xs text-center text-gray-500">T3</div>
        <div className="text-xs text-center text-gray-500">T4</div>
        <div className="text-xs text-center text-gray-500">T5</div>
        <div className="text-xs text-center text-gray-500">T6</div>
        <div className="text-xs text-center text-gray-500">T7</div>

        {/* Empty cells for first week */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="w-6 h-6"></div>
        ))}

        {/* Day cells */}
        {heatmapData.map(({ day, amount }) => (
          <div
            key={day}
            className={`w-6 h-6 rounded-sm border border-gray-300 ${getHeatmapColor(amount)} 
                       flex items-center justify-center text-xs font-medium text-gray-700
                       cursor-default select-none transition-all duration-200 hover:scale-110 hover:shadow-md
                       hover:border-gray-400 hover:z-10 relative`}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const scrollY = window.scrollY || document.documentElement.scrollTop
              setHeatmapTooltip({
                day,
                amount,
                x: rect.left + rect.width / 2,
                y: rect.top + scrollY
              })
            }}
            onMouseLeave={() => setHeatmapTooltip(null)}
          >
            <span className="pointer-events-none">{day}</span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Tổng thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {stats ? formatCurrency(stats.totalIncome) : '0 ₫'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Tổng chi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-600">
              {stats ? formatCurrency(stats.totalExpenses) : '0 ₫'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Chi tiêu TB/ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {stats ? formatCurrency(stats.averageDaily) : '0 ₫'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              So tháng trước
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${stats && stats.comparisonPercentage !== null && stats.comparisonPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats ? 
                stats.comparisonPercentage === null ? 'N/A' :
                `${stats.comparisonPercentage >= 0 ? '+' : ''}${stats.comparisonPercentage.toFixed(1)}%` 
                : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Pie Chart */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 text-base md:text-lg">Chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="total"
                    animationDuration={800}
                  >
                    {categoryData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Chi tiêu theo ngày (tháng này)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renderHeatmap()}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span>Ít</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <div className="w-3 h-3 bg-orange-200 rounded"></div>
                  <div className="w-3 h-3 bg-red-200 rounded"></div>
                </div>
                <span>Nhiều</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Heatmap Tooltip using Portal */}
      {heatmapTooltip && createPortal(
        <div
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-3 pointer-events-none whitespace-nowrap"
          style={{
            left: Math.min(Math.max(heatmapTooltip.x - 100, 10), window.innerWidth - 210),
            top: Math.max(heatmapTooltip.y - 80, 10),
          }}
        >
          <p className="text-gray-700 text-sm">
            <span className="font-medium text-gray-900">
              Ngày {heatmapTooltip.day}: 
            </span>
            <span className="font-semibold text-green-600 ml-1">
              {heatmapTooltip.amount > 0 
                ? formatCurrency(heatmapTooltip.amount)
                : 'Không có giao dịch'
              }
            </span>
          </p>
        </div>,
        document.body
      )}
    </div>
  )
}

