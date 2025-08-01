import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { TransactionForm } from '@/components/TransactionForm'
import { AITransactionForm } from '@/components/AITransactionForm'

interface Transaction {
  _id: string
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  notes?: string
}

interface TransactionFilters {
  type?: string
  category?: string
  keyword?: string
  month?: string
}

interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  balance: number
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

const MONTHS = [
  { value: 'all', label: 'Tất cả' },
  { value: '1', label: 'Tháng 1' },
  { value: '2', label: 'Tháng 2' },
  { value: '3', label: 'Tháng 3' },
  { value: '4', label: 'Tháng 4' },
  { value: '5', label: 'Tháng 5' },
  { value: '6', label: 'Tháng 6' },
  { value: '7', label: 'Tháng 7' },
  { value: '8', label: 'Tháng 8' },
  { value: '9', label: 'Tháng 9' },
  { value: '10', label: 'Tháng 10' },
  { value: '11', label: 'Tháng 11' },
  { value: '12', label: 'Tháng 12' }
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  })
  const [loading, setLoading] = useState(true)
  
  // Lấy tháng hiện tại làm mặc định
  const currentMonth = (new Date().getMonth() + 1).toString()
  
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    category: 'all',
    keyword: '',
    month: currentMonth
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [, setShowTransactionForm] = useState(false)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await api.getTransactions()
      setTransactions(data)
      setFilteredTransactions(data)
      calculateSummary(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Không thể tải dữ liệu giao dịch')
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (data: Transaction[]) => {
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    setSummary({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    })
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    // Filter by keyword
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(keyword) ||
        t.notes?.toLowerCase().includes(keyword)
      )
    }

    // Filter by month - mặc định là tháng hiện tại
    if (filters.month && filters.month !== 'all') {
      const month = parseInt(filters.month)
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() + 1 === month
      })
    }

    setFilteredTransactions(filtered)
    calculateSummary(filtered)
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id)
      toast.success('Xóa giao dịch thành công!')
      fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Không thể xóa giao dịch')
    }
  }

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false)
    setSelectedTransaction(null)
    fetchTransactions()
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, transactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
  }

  // Lấy tên tháng hiện tại để hiển thị
  const getCurrentMonthLabel = () => {
    const currentMonth = new Date().getMonth() + 1
    return MONTHS.find(month => month.value === currentMonth.toString())?.label || 'Tháng hiện tại'
  }

  // Hàm để lấy màu nền cho hàng dựa trên loại giao dịch
  const getRowBackgroundColor = (type: 'income' | 'expense') => {
    if (type === 'income') {
      return 'bg-green-100 hover:bg-green-200'
    } else {
      return 'bg-red-100 hover:bg-red-200'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử giao dịch</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi các giao dịch của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <AITransactionForm
            onSuccess={handleTransactionSuccess}
          />
          <TransactionForm
            mode="add"
            onSuccess={handleTransactionSuccess}
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Thêm giao dịch
              </Button>
            }
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-300 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Month Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tháng</label>
              <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                <SelectTrigger className="bg-gray-100 border-gray-300">
                  <SelectValue placeholder={getCurrentMonthLabel()} />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Loại</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="bg-gray-100 border-gray-300">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="income">Thu</SelectItem>
                  <SelectItem value="expense">Chi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Danh mục</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="bg-gray-100 border-gray-300">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  className="pl-10 bg-gray-100 border-gray-300"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Tổng thu</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Tổng chi</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Chênh lệch</p>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${summary.balance >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                <span className={`text-xl ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.balance >= 0 ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-white border border-gray-300 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Danh sách giao dịch ({filteredTransactions.length})
            {filters.month !== 'all' && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {getCurrentMonthLabel()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có giao dịch</h3>
              <p className="text-gray-500">
                {filters.month !== 'all' 
                  ? `Không có giao dịch nào trong ${getCurrentMonthLabel()}`
                  : 'Hãy thêm giao dịch đầu tiên của bạn'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg">
              <Table className="border-0">
                <TableHeader>
                  <TableRow className="bg-gray-200 border-gray-300">
                    <TableHead className="text-gray-800">Ngày</TableHead>
                    <TableHead className="text-gray-800">Mô tả</TableHead>
                    <TableHead className="text-gray-800">Danh mục</TableHead>
                    <TableHead className="text-gray-800">Loại</TableHead>
                    <TableHead className="text-gray-800 text-right">Số tiền</TableHead>
                    <TableHead className="text-gray-800 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction._id} 
                      className={`transition-colors border-gray-300 ${getRowBackgroundColor(transaction.type)}`}
                    >
                      <TableCell className="text-gray-900">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          {transaction.notes && (
                            <p className="text-sm text-gray-600 truncate">
                              {transaction.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className={transaction.type === 'income' 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-red-200 text-red-800'
                          }
                        >
                          {transaction.type === 'income' ? 'Thu' : 'Chi'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowTransactionDetails(true)
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <TransactionForm
                            mode="edit"
                            transaction={transaction}
                            onSuccess={handleTransactionSuccess}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-gray-900">Chi tiết giao dịch</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày</label>
                  <p className="text-gray-900">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại</label>
                  <Badge 
                    variant={selectedTransaction.type === 'income' ? 'default' : 'destructive'}
                    className={selectedTransaction.type === 'income' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                    }
                  >
                    {selectedTransaction.type === 'income' ? 'Thu' : 'Chi'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Danh mục</label>
                  <p className="text-gray-900">{selectedTransaction.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số tiền</label>
                  <p className={`font-semibold ${selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="text-gray-900">{selectedTransaction.description}</p>
              </div>
              {selectedTransaction.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                  <p className="text-gray-900">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
