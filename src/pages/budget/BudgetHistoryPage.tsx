import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface BudgetHistory {
  _id: string
  month: number
  year: number
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalCarryOver: number
  jars: Array<{
    name: string
    category: string
    budgetAmount: number
    spent: number
    remaining: number
    carryOver: number
    color: string
  }>
  isCompleted: boolean
  createdAt: string
}

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

export default function BudgetHistoryPage() {
  const [history, setHistory] = useState<BudgetHistory[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgetHistory()
  }, [selectedYear])

  const fetchBudgetHistory = async () => {
    try {
      setLoading(true)
      const historyData = await api.getBudgetHistory(selectedYear)
      
      // Transform Budget data to BudgetHistory format
      const transformedHistory: BudgetHistory[] = historyData.map(budget => ({
        _id: budget._id || '',
        month: budget.month,
        year: budget.year,
        totalBudget: budget.totalBudget,
        totalSpent: budget.jars.reduce((sum, jar) => sum + jar.spent, 0),
        totalRemaining: budget.totalBudget - budget.jars.reduce((sum, jar) => sum + jar.spent, 0),
        totalCarryOver: budget.jars.reduce((sum, jar) => sum + jar.carryOver, 0),
        jars: budget.jars.map(jar => ({
          name: jar.name,
          category: jar.category,
          budgetAmount: jar.budgetAmount,
          spent: jar.spent,
          remaining: jar.budgetAmount - jar.spent,
          carryOver: jar.carryOver,
          color: jar.color
        })),
        isCompleted: budget.isCompleted,
        createdAt: budget.createdAt || ''
      }))
      
      setHistory(transformedHistory)
    } catch (error) {
      console.error('Error fetching budget history:', error)
      toast.error('Có lỗi xảy ra khi tải lịch sử ngân sách')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year)
    }
    return years
  }

  const getMonthData = (month: number): BudgetHistory | null => {
    return history.find(h => h.month === month) || null
  }

  const calculateSavingsRate = (budget: number, spent: number): number => {
    if (budget === 0) return 0
    return ((budget - spent) / budget) * 100
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Lịch sử ngân sách
          </h1>
          <p className="text-gray-600">
            Xem lại các tháng đã hoàn thành và theo dõi tiến độ tiết kiệm
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailableYears().map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Year Summary */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Tổng ngân sách năm
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {formatCurrency(history.reduce((sum, h) => sum + h.totalBudget, 0))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                Tổng chi tiêu năm
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {formatCurrency(history.reduce((sum, h) => sum + h.totalSpent, 0))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Tổng tiết kiệm
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(history.reduce((sum, h) => sum + h.totalRemaining, 0))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Tỷ lệ tiết kiệm
              </CardTitle>
              <ArrowDownRight className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-purple-600">
                {calculateSavingsRate(
                  history.reduce((sum, h) => sum + h.totalBudget, 0),
                  history.reduce((sum, h) => sum + h.totalSpent, 0)
                ).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((monthName, index) => {
          const monthNumber = index + 1
          const monthData = getMonthData(monthNumber)
          
          return (
            <Card 
              key={monthNumber}
              className={`relative ${
                monthData 
                  ? monthData.isCompleted 
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-base font-semibold ${
                    monthData 
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}>
                    {monthName}
                  </CardTitle>
                  {monthData && (
                    <Badge 
                      variant={monthData.isCompleted ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {monthData.isCompleted ? 'Hoàn thành' : 'Đang chạy'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {monthData ? (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngân sách</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(monthData.totalBudget)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đã chi</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(monthData.totalSpent)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiết kiệm</span>
                        <span className={`font-medium ${
                          monthData.totalRemaining >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(monthData.totalRemaining)}
                        </span>
                      </div>
                      
                      {monthData.totalCarryOver > 0 && (
                        <div className="flex justify-between">
                          <span className="text-purple-600">Chuyển tiếp</span>
                          <span className="font-medium text-purple-600">
                            {formatCurrency(monthData.totalCarryOver)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Tỷ lệ chi tiêu</span>
                        <span>
                          {((monthData.totalSpent / monthData.totalBudget) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((monthData.totalSpent / monthData.totalBudget) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                    
                    {/* Jar breakdown */}
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-medium">
                        Hũ ({monthData.jars.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {monthData.jars.slice(0, 4).map((jar, jarIndex) => (
                          <div
                            key={jarIndex}
                            className="w-3 h-3 rounded border border-gray-300"
                            style={{ backgroundColor: jar.color }}
                            title={`${jar.name}: ${formatCurrency(jar.spent)}/${formatCurrency(jar.budgetAmount)}`}
                          />
                        ))}
                        {monthData.jars.length > 4 && (
                          <div className="text-xs text-gray-500">
                            +{monthData.jars.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">
                      Chưa có dữ liệu
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No data message */}
      {history.length === 0 && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có lịch sử ngân sách
            </h3>
            <p className="text-gray-600 text-center">
              Bắt đầu tạo ngân sách hàng tháng để xem lịch sử tại đây
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
