import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Wallet, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { api, Budget, BudgetCompletionResult } from '@/lib/api'
import PendingCompletionBanner from '@/components/budget/PendingCompletionBanner'
import GapCompletionDialog from '@/components/budget/GapCompletionDialog'

interface BudgetJar {
  _id?: string
  name: string
  category: string
  budgetAmount: number
  spent: number
  carryOver: number
  remaining?: number
  percentage?: number
  color: string
  isActive: boolean
}

interface BudgetStats {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalCarryOver: number
  jars: BudgetJar[]
}

const CATEGORIES = [
  'Ăn uống',
  'Đi lại', 
  'Giải trí',
  'Hóa đơn',
  'Mua sắm',
  'Y tế',
  'Giáo dục',
  'Khác'
]

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
]

export default function BudgetPage() {
  const [stats, setStats] = useState<BudgetStats | null>(null)
  const [pendingBudgets, setPendingBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [gapDialogOpen, setGapDialogOpen] = useState(false)
  const [gapInfo, setGapInfo] = useState<BudgetCompletionResult['gap'] | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isSmartMode, setIsSmartMode] = useState(true) // Sử dụng smart mode by default
  const [editingBudget, setEditingBudget] = useState({
    totalBudget: 0,
    jars: [] as BudgetJar[]
  })

  useEffect(() => {
    if (isSmartMode) {
      fetchSmartBudget()
    } else {
      fetchBudgetStats()
    }
  }, [currentMonth, currentYear, isSmartMode])

  const fetchSmartBudget = async () => {
    try {
      setLoading(true)
      setConnectionError(false)
      
      const { budget, pendingBudgets } = await api.getSmartBudget()
      
      if (budget) {
        // Update current month/year to match the smart budget
        setCurrentMonth(budget.month)
        setCurrentYear(budget.year)
        
        // Fetch stats for this budget
        const stats = await api.getBudgetStats(budget.month, budget.year)
        setStats(stats)
      } else {
        setStats(null)
      }
      
      setPendingBudgets(pendingBudgets)
    } catch (error) {
      console.error('Error fetching smart budget:', error)
      setConnectionError(true)
      
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Có lỗi xảy ra khi tải dữ liệu budget')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgetStats = async () => {
    try {
      setLoading(true)
      setConnectionError(false)
      
      const stats = await api.getBudgetStats(currentMonth, currentYear)
      
      setStats(stats)
    } catch (error) {
      console.error('Error fetching budget stats:', error)
      setConnectionError(true)
      
      // Kiểm tra loại lỗi
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.')
      } else {
        toast.error('Có lỗi xảy ra khi tải dữ liệu ngân sách')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetCompleted = () => {
    // Refresh smart budget after completing a budget
    if (isSmartMode) {
      fetchSmartBudget()
    } else {
      // Chuyển về smart mode để hiển thị budget phù hợp nhất
      setIsSmartMode(true)
      fetchSmartBudget()
    }
  }

  const handleManualNavigation = (month: number, year: number) => {
    setIsSmartMode(false)
    setCurrentMonth(month)
    setCurrentYear(year)
  }

  const handleBackToSmart = () => {
    setIsSmartMode(true)
  }

  const createSampleBudget = async () => {
    try {
      const sampleBudget = {
        month: currentMonth,
        year: currentYear,
        totalBudget: 10000000, // 10 triệu VND
        jars: [
          { name: 'Ăn uống hàng ngày', category: 'Ăn uống', budgetAmount: 3000000, spent: 0, carryOver: 0, color: '#3B82F6', isActive: true },
          { name: 'Chi phí đi lại', category: 'Đi lại', budgetAmount: 1500000, spent: 0, carryOver: 0, color: '#EF4444', isActive: true },
          { name: 'Hóa đơn điện nước', category: 'Hóa đơn', budgetAmount: 2000000, spent: 0, carryOver: 0, color: '#10B981', isActive: true },
          { name: 'Mua sắm cá nhân', category: 'Mua sắm', budgetAmount: 1500000, spent: 0, carryOver: 0, color: '#F59E0B', isActive: true },
          { name: 'Giải trí & Thư giãn', category: 'Giải trí', budgetAmount: 1000000, spent: 0, carryOver: 0, color: '#8B5CF6', isActive: true },
          { name: 'Dự phòng khẩn cấp', category: 'Khác', budgetAmount: 1000000, spent: 0, carryOver: 0, color: '#06B6D4', isActive: true }
        ]
      }

      const budget = await api.createOrUpdateBudget(sampleBudget)
      toast.success('Đã tạo ngân sách mẫu thành công!')
      
      // Refresh data after creating sample budget
      if (isSmartMode) {
        fetchSmartBudget()
      } else {
        fetchBudgetStats()
      }
    } catch (error) {
      console.error('Error creating sample budget:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo ngân sách mẫu')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleEditBudget = () => {
    if (stats) {
      setEditingBudget({
        totalBudget: stats.totalBudget,
        jars: stats.jars.map(jar => ({
          name: jar.name,
          category: jar.category,
          budgetAmount: jar.budgetAmount,
          spent: jar.spent,
          carryOver: jar.carryOver,
          color: jar.color,
          isActive: jar.isActive
        }))
      })
    } else {
      setEditingBudget({
        totalBudget: 0,
        jars: []
      })
    }
    setEditDialogOpen(true)
  }

  const addNewJar = () => {
    const usedCategories = editingBudget.jars.map(jar => jar.category)
    const availableCategory = CATEGORIES.find(cat => !usedCategories.includes(cat))
    
    if (!availableCategory) {
      toast.error('Đã sử dụng hết tất cả danh mục')
      return
    }

    const newJar: BudgetJar = {
      name: availableCategory,
      category: availableCategory,
      budgetAmount: 0,
      spent: 0,
      carryOver: 0,
      color: COLORS[editingBudget.jars.length % COLORS.length],
      isActive: true
    }

    setEditingBudget(prev => ({
      ...prev,
      jars: [...prev.jars, newJar]
    }))
  }

  const updateJar = (index: number, field: keyof BudgetJar, value: any) => {
    setEditingBudget(prev => ({
      ...prev,
      jars: prev.jars.map((jar, i) => 
        i === index ? { ...jar, [field]: value } : jar
      )
    }))
  }

  const removeJar = (index: number) => {
    setEditingBudget(prev => ({
      ...prev,
      jars: prev.jars.filter((_, i) => i !== index)
    }))
  }

  const saveBudget = async () => {
    try {
      const totalJarBudget = editingBudget.jars.reduce((sum, jar) => sum + jar.budgetAmount, 0)
      
      if (totalJarBudget > editingBudget.totalBudget) {
        toast.error('Tổng ngân sách các hũ không được vượt quá tổng ngân sách')
        return
      }

      const budget = await api.createOrUpdateBudget({
        month: currentMonth,
        year: currentYear,
        totalBudget: editingBudget.totalBudget,
        jars: editingBudget.jars
      })
      
      toast.success('Đã lưu ngân sách thành công!')
      setEditDialogOpen(false)
      
      // Refresh data after saving budget
      if (isSmartMode) {
        fetchSmartBudget()
      } else {
        fetchBudgetStats()
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu ngân sách')
    }
  }

  const completeBudgetMonth = async () => {
    try {
      const result = await api.completeBudgetMonth(currentMonth, currentYear)
      
      if (result.gap) {
        // Có gap, hiển thị dialog cho user chọn
        setGapInfo(result.gap)
        setGapDialogOpen(true)
      } else {
        // Không có gap, hoàn thành bình thường
        toast.success('Đã hoàn thành budget tháng này và tạo budget cho tháng sau!')
        handleBudgetCompleted()
      }
    } catch (error) {
      console.error('Error completing budget month:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi hoàn thành budget tháng')
    }
  }

  const handleGapCompletion = async (
    action: 'create_current' | 'create_next' | 'skip',
    targetMonth?: number,
    targetYear?: number
  ) => {
    try {
      const result = await api.completeWithGap(currentMonth, currentYear, action, targetMonth, targetYear)
      
      let message = `Đã hoàn thành tháng ${currentMonth}/${currentYear}`
      if (result.nextBudget) {
        message += ` và tạo ngân sách tháng ${result.nextBudget.month}/${result.nextBudget.year}`
      }
      
      toast.success(message)
      handleBudgetCompleted()
    } catch (error) {
      console.error('Error completing budget with gap:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi hoàn thành budget')
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Gap Completion Dialog */}
      {gapInfo && (
        <GapCompletionDialog
          open={gapDialogOpen}
          onOpenChange={setGapDialogOpen}
          completingMonth={currentMonth}
          completingYear={currentYear}
          currentMonth={gapInfo.suggestion.current.month}
          currentYear={gapInfo.suggestion.current.year}
          monthsDiff={gapInfo.monthsDiff}
          onConfirm={handleGapCompletion}
        />
      )}

      {/* Pending Completion Banner */}
      {pendingBudgets.length > 0 && (
        <PendingCompletionBanner 
          pendingBudgets={pendingBudgets}
          onBudgetCompleted={handleBudgetCompleted}
          onGapDetected={(gapInfo, budget) => {
            // Cập nhật context cho gap dialog
            setCurrentMonth(budget.month)
            setCurrentYear(budget.year)
            setGapInfo(gapInfo)
            setGapDialogOpen(true)
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Ngân sách theo Hũ
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              Tháng {currentMonth}/{currentYear}
            </p>
            {isSmartMode && (
              <Badge variant="outline" className="text-xs">
                Thông minh
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          {!isSmartMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
                  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
                  handleManualNavigation(prevMonth, prevYear)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
                  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear
                  handleManualNavigation(nextMonth, nextYear)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSmart}
              >
                Tự động
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSmartMode(false)}
            >
              Điều hướng thủ công
            </Button>
          )}
        </div>
      </div>

      {/* Budget Controls */}
      <div className="flex items-center justify-end gap-2">
        <Button onClick={handleEditBudget} className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa ngân sách
        </Button>
        
        {stats && stats.jars.length > 0 && (
          <Button 
            onClick={completeBudgetMonth}
            className="bg-green-600 hover:bg-green-700"
          >
            <PiggyBank className="w-4 h-4 mr-2" />
            Hoàn thành tháng
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Tổng ngân sách
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalBudget)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                Đã chi tiêu
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalSpent)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Còn lại
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRemaining)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Tiền dư t.trước
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-purple-600">
                {formatCurrency(stats.totalCarryOver)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Jars */}
      {connectionError ? (
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Không thể kết nối đến server
            </h3>
            <p className="text-red-600 text-center mb-4 max-w-md">
              Backend server chưa được khởi động. Vui lòng:
            </p>
            <div className="space-y-2 text-sm text-red-600">
              <div className="flex items-center gap-2">
                <span>1️⃣</span>
                <span>Mở terminal và chạy: <code className="bg-red-100 px-2 py-1 rounded">cd e:\code\costMN\backend && npm start</code></span>
              </div>
              <div className="flex items-center gap-2">
                <span>2️⃣</span>
                <span>Hoặc double-click file <code className="bg-red-100 px-2 py-1 rounded">start-backend.bat</code></span>
              </div>
            </div>
            <Button 
              onClick={() => {
                setConnectionError(false)
                fetchBudgetStats()
              }}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Thử lại kết nối
            </Button>
          </CardContent>
        </Card>
      ) : stats && stats.jars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {stats.jars.filter(jar => jar.isActive).map((jar, index) => (
            <Card key={index} className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
                    {jar.name}
                  </CardTitle>
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: jar.color }}
                  ></div>
                </div>
                <Badge variant="secondary" className="w-fit text-xs">
                  {jar.category}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ngân sách</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(jar.budgetAmount + jar.carryOver)}
                    </span>
                  </div>
                  
                  {jar.carryOver > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">+ Tiền dư t.trước</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(jar.carryOver)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đã chi</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(jar.spent)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Còn lại</span>
                    <span className={`font-medium ${
                      (jar.remaining || 0) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(jar.remaining || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tiến độ</span>
                    <span>{(jar.percentage || 0).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(jar.percentage || 0, 100)} 
                    className="h-2"
                    style={{
                      '--progress-foreground': jar.percentage && jar.percentage > 100 ? '#EF4444' : jar.color
                    } as any}
                  />
                  {jar.percentage && jar.percentage > 100 && (
                    <p className="text-xs text-red-600">
                      Vượt ngân sách {(jar.percentage - 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PiggyBank className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isSmartMode ? 'Chưa có ngân sách nào' : `Chưa có ngân sách cho tháng ${currentMonth}/${currentYear}`}
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md mx-auto">
              {isSmartMode 
                ? 'Hệ thống hũ ngân sách giúp bạn chia tiền thành các mục đích cụ thể. Tiền dư cuối tháng sẽ tự động chuyển sang tháng sau.'
                : `Tạo ngân sách cho tháng ${currentMonth}/${currentYear} để bắt đầu quản lý chi tiêu theo hũ.`
              }
            </p>
            <div className="space-y-3">
              <Button onClick={handleEditBudget} className="bg-blue-600 hover:bg-blue-700 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Tạo ngân sách cho tháng {currentMonth}/{currentYear}
              </Button>
              <Button 
                onClick={createSampleBudget}
                variant="outline" 
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <PiggyBank className="w-4 h-4 mr-2" />
                Tạo ngân sách mẫu (10 triệu VND)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Budget Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Chỉnh sửa ngân sách tháng {currentMonth}/{currentYear}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Total Budget */}
            <div className="space-y-2">
              <Label htmlFor="totalBudget" className="text-gray-900">
                Tổng ngân sách (VND)
              </Label>
              <Input
                id="totalBudget"
                type="number"
                value={editingBudget.totalBudget}
                onChange={(e) => setEditingBudget(prev => ({
                  ...prev,
                  totalBudget: Number(e.target.value)
                }))}
                className="bg-white"
              />
            </div>

            {/* Jars */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-900">Các hũ ngân sách</Label>
                <Button 
                  onClick={addNewJar}
                  variant="outline"
                  size="sm"
                  disabled={editingBudget.jars.length >= CATEGORIES.length}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm hũ
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {editingBudget.jars.map((jar, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-gray-700">Tên hũ</Label>
                        <Input
                          value={jar.name}
                          onChange={(e) => updateJar(index, 'name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-700">Danh mục</Label>
                        <Select 
                          value={jar.category} 
                          onValueChange={(value) => updateJar(index, 'category', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem 
                                key={category} 
                                value={category}
                                disabled={editingBudget.jars.some((j, i) => i !== index && j.category === category)}
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-700">Ngân sách</Label>
                        <Input
                          type="number"
                          value={jar.budgetAmount}
                          onChange={(e) => updateJar(index, 'budgetAmount', Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-sm text-gray-700">Màu</Label>
                          <div className="flex gap-1 mt-1">
                            {COLORS.slice(0, 6).map(color => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded border-2 ${
                                  jar.color === color ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateJar(index, 'color', color)}
                              />
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeJar(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {jar.carryOver > 0 && (
                      <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                        <span className="text-purple-700">
                          Tiền dư từ tháng trước: {formatCurrency(jar.carryOver)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {editingBudget.jars.length > 0 && (
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-blue-700">
                    Tổng ngân sách các hũ: {formatCurrency(editingBudget.jars.reduce((sum, jar) => sum + jar.budgetAmount, 0))}
                    <br />
                    Còn lại: {formatCurrency(editingBudget.totalBudget - editingBudget.jars.reduce((sum, jar) => sum + jar.budgetAmount, 0))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={saveBudget} className="bg-blue-600 hover:bg-blue-700">
                Lưu ngân sách
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
