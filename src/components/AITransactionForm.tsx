import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bot, Upload, Send, Edit, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface AITransaction {
  date?: string | null  // Make date optional since AI might not return it
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  notes?: string
  confidence: number
}

interface AITransactionFormProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const CATEGORIES = [
  'Ăn uống',
  'Đi lại',
  'Giải trí',
  'Hóa đơn',
  'Mua sắm',
  'Y tế',
  'Giáo dục',
  'Lương',
  'Freelance',
  'Đầu tư',
  'Khác'
]

export function AITransactionForm({ onSuccess, trigger }: AITransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [aiTransactions, setAiTransactions] = useState<AITransaction[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset form khi đóng dialog
      setText('')
      setImageFile(null)
      setImagePreview('')
      setAiTransactions([])
      setEditingIndex(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAnalyze = async () => {
    if (!text.trim() && !imageFile) {
      toast.error('Vui lòng nhập mô tả hoặc tải lên ảnh')
      return
    }

    setLoading(true)
    try {
      const data = await api.analyzeTransaction(text, imageFile)
      
      if (data.success && data.transactions) {
        // Logic xử lý ngày tháng cho AI transactions
        const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        const updatedTransactions = data.transactions.map((transaction: AITransaction) => {
          // Nếu AI không trả về date (null/undefined), dùng ngày hôm nay
          if (!transaction.date) {
            return { ...transaction, date: currentDate }
          }
          
          try {
            const transactionDate = new Date(transaction.date)
            
            // Kiểm tra tính hợp lệ của ngày:
            // 1. Phải là ngày hợp lệ (không phải NaN)
            // 2. Nằm trong khoảng thời gian hợp lý
            if (!isNaN(transactionDate.getTime())) {
              return { ...transaction, date: transaction.date } // Giữ nguyên ngày từ AI
            } else {
              // Nếu ngày không hợp lệ, dùng ngày hôm nay
              return { ...transaction, date: currentDate }
            }
          } catch {
            // Nếu có lỗi khi parse date, dùng ngày hôm nay
            return { ...transaction, date: currentDate }
          }
        })
        
        // Debug logging
        console.log('AI Response transactions:', data.transactions)
        console.log('Updated transactions with date logic:', updatedTransactions)
        
        setAiTransactions(updatedTransactions)
        toast.success(`Đã phân tích được ${updatedTransactions.length} giao dịch`)
      } else {
        toast.error('Không thể phân tích dữ liệu. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error analyzing transaction:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi phân tích dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTransaction = (index: number) => {
    setEditingIndex(index)
  }

  const handleUpdateTransaction = (index: number, field: keyof AITransaction, value: any) => {
    const updatedTransactions = [...aiTransactions]
    updatedTransactions[index] = { ...updatedTransactions[index], [field]: value }
    setAiTransactions(updatedTransactions)
  }

  const handleDeleteTransaction = (index: number) => {
    setAiTransactions(aiTransactions.filter((_, i) => i !== index))
  }

  const handleSaveAll = async () => {
    if (aiTransactions.length === 0) {
      toast.error('Không có giao dịch nào để lưu')
      return
    }

    setLoading(true)
    try {
      const savePromises = aiTransactions.map(transaction => 
        api.createTransaction({
          date: transaction.date || new Date().toISOString().split('T')[0],
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description,
          notes: transaction.notes
        })
      )

      await Promise.all(savePromises)
      toast.success(`Đã lưu ${aiTransactions.length} giao dịch thành công!`)
      
      // Reset form sau khi lưu thành công
      setOpen(false)
      setText('')
      setImageFile(null)
      setImagePreview('')
      setAiTransactions([])
      setEditingIndex(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      onSuccess?.()
    } catch (error) {
      console.error('Error saving transactions:', error)
      toast.error('Có lỗi xảy ra khi lưu giao dịch')
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

  const defaultTrigger = (
    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
      <Bot className="w-4 h-4 mr-2" />
      Thêm bằng AI
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[95vh] overflow-y-auto bg-white border-2 border-gray-200">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl text-gray-900">
            <Bot className="w-5 h-5" />
            Thêm giao dịch bằng AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 pt-4">
          {/* Input Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Mô tả giao dịch</label>
              <Textarea
                placeholder="Nhập mô tả giao dịch hoặc sao chép từ hóa đơn..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                spellCheck={false}
                autoComplete="off"
                className="resize-none bg-white border-gray-300 text-sm md:text-base"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Tải lên ảnh hóa đơn</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 md:p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors min-h-[120px] flex flex-col justify-center">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img src={imagePreview} alt="Preview" className="max-h-20 md:max-h-32 mx-auto rounded object-contain" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="text-xs md:text-sm"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Xóa ảnh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-400" />
                    <p className="text-xs md:text-sm text-gray-500">Kéo thả ảnh hoặc click để chọn</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs md:text-sm"
                    >
                      Chọn ảnh
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={loading || (!text.trim() && !imageFile)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm md:text-base px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Phân tích bằng AI
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {aiTransactions.length > 0 && (
            <div className="space-y-4 bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Kết quả phân tích</h3>
                <Button 
                  onClick={handleSaveAll} 
                  disabled={loading} 
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-sm md:text-base"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Lưu tất cả ({aiTransactions.length})
                </Button>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {aiTransactions.map((transaction, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                          {transaction.type === 'income' ? 'Thu' : 'Chi'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {editingIndex === index ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingIndex(null)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTransaction(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTransaction(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Amount */}
                      <div className="text-lg font-semibold text-gray-900">
                        {editingIndex === index ? (
                          <Input
                            type="number"
                            value={transaction.amount}
                            onChange={(e) => handleUpdateTransaction(index, 'amount', Number(e.target.value))}
                            className="text-base"
                          />
                        ) : (
                          formatCurrency(transaction.amount)
                        )}
                      </div>
                      
                      {/* Description */}
                      <div>
                        <span className="text-sm font-medium text-gray-500">Mô tả:</span>
                        <div className="mt-1">
                          {editingIndex === index ? (
                            <Input
                              value={transaction.description}
                              onChange={(e) => handleUpdateTransaction(index, 'description', e.target.value)}
                              className="text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{transaction.description}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Category and Date */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Danh mục:</span>
                          <div className="mt-1">
                            {editingIndex === index ? (
                              <select
                                value={transaction.category}
                                onChange={(e) => handleUpdateTransaction(index, 'category', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white"
                              >
                                {CATEGORIES.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            ) : (
                              <Badge variant="secondary" className="text-xs">{transaction.category}</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">Ngày:</span>
                          <div className="mt-1">
                            {editingIndex === index ? (
                              <Input
                                type="date"
                                value={transaction.date || ''}
                                onChange={(e) => handleUpdateTransaction(index, 'date', e.target.value)}
                                className="text-sm"
                              />
                            ) : (
                              <span className="text-sm text-gray-900">
                                {transaction.date ? new Date(transaction.date).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Confidence */}
                      <div>
                        <span className="text-sm font-medium text-gray-500">Độ tin cậy:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${transaction.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{transaction.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[100px]">Ngày</TableHead>
                      <TableHead className="min-w-[80px]">Loại</TableHead>
                      <TableHead className="min-w-[100px]">Danh mục</TableHead>
                      <TableHead className="min-w-[120px]">Số tiền</TableHead>
                      <TableHead className="min-w-[150px]">Mô tả</TableHead>
                      <TableHead className="min-w-[100px]">Độ tin cậy</TableHead>
                      <TableHead className="min-w-[100px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {editingIndex === index ? (
                            <Input
                              type="date"
                              value={transaction.date || ''}
                              onChange={(e) => handleUpdateTransaction(index, 'date', e.target.value)}
                              className="min-w-[140px]"
                            />
                          ) : (
                            <span className="text-sm">
                              {transaction.date ? new Date(transaction.date).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <select
                              value={transaction.type}
                              onChange={(e) => handleUpdateTransaction(index, 'type', e.target.value)}
                              className="w-full p-2 border rounded text-sm bg-white"
                            >
                              <option value="expense">Chi</option>
                              <option value="income">Thu</option>
                            </select>
                          ) : (
                            <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                              {transaction.type === 'income' ? 'Thu' : 'Chi'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <select
                              value={transaction.category}
                              onChange={(e) => handleUpdateTransaction(index, 'category', e.target.value)}
                              className="w-full p-2 border rounded text-sm bg-white"
                            >
                              {CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          ) : (
                            <Badge variant="secondary" className="text-xs">{transaction.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <Input
                              type="number"
                              value={transaction.amount}
                              onChange={(e) => handleUpdateTransaction(index, 'amount', Number(e.target.value))}
                              className="min-w-[100px]"
                            />
                          ) : (
                            <span className="font-semibold text-sm">{formatCurrency(transaction.amount)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <Input
                              value={transaction.description}
                              onChange={(e) => handleUpdateTransaction(index, 'description', e.target.value)}
                              className="min-w-[120px]"
                            />
                          ) : (
                            <div className="max-w-[150px]">
                              <span className="text-sm truncate block" title={transaction.description}>
                                {transaction.description}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 md:w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${transaction.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{transaction.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {editingIndex === index ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingIndex(null)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTransaction(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTransaction(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
