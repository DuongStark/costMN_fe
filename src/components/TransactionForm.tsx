import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Edit } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"

interface Transaction {
  _id?: string
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  notes?: string
}

interface TransactionFormProps {
  mode?: 'add' | 'edit'
  transaction?: Transaction
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const categories = [
  { value: 'Ăn uống', label: 'Ăn uống' },
  { value: 'Đi lại', label: 'Đi lại' },
  { value: 'Giải trí', label: 'Giải trí' },
  { value: 'Hóa đơn', label: 'Hóa đơn' },
  { value: 'Mua sắm', label: 'Mua sắm' },
  { value: 'Y tế', label: 'Y tế' },
  { value: 'Giáo dục', label: 'Giáo dục' },
  { value: 'Lương', label: 'Lương' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Đầu tư', label: 'Đầu tư' },
  { value: 'Khác', label: 'Khác' },
]

export function TransactionForm({ mode = 'add', transaction, onSuccess, trigger }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Function to format date for input[type="date"]
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0]
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0]
      }
      return date.toISOString().split('T')[0]
    } catch {
      return new Date().toISOString().split('T')[0]
    }
  }

  const [formData, setFormData] = useState({
    date: transaction?.date ? formatDateForInput(transaction.date) : new Date().toISOString().split('T')[0],
    type: transaction?.type || 'expense' as 'income' | 'expense',
    category: transaction?.category || '',
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    notes: transaction?.notes || '',
  })

  // Update form data when transaction prop changes (for edit mode)
  useEffect(() => {
    if (transaction) {
      setFormData({
        date: formatDateForInput(transaction.date),
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        description: transaction.description,
        notes: transaction.notes || '',
      })
    }
  }, [transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category) {
      toast.error('Vui lòng chọn danh mục')
      return
    }

    setLoading(true)
    try {
      const transactionData = {
        date: formData.date,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        notes: formData.notes || undefined,
      }

      if (mode === 'edit' && transaction?._id) {
        await api.updateTransaction(transaction._id, transactionData)
        toast.success('Cập nhật giao dịch thành công!')
      } else {
        await api.createTransaction(transactionData)
        toast.success('Thêm giao dịch thành công!')
      }

      setOpen(false)
      onSuccess?.()
      
      // Reset form if adding new
      if (mode === 'add') {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          category: '',
          amount: '',
          description: '',
          notes: '',
        })
      }
    } catch (error: any) {
      console.error('Error saving transaction:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi lưu giao dịch')
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button>
      {mode === 'add' ? (
        <>
          <Plus className="w-4 h-4 mr-2" />
          Thêm giao dịch
        </>
      ) : (
        <>
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </>
      )}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-2 border-gray-200">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-gray-900">
            {mode === 'add' ? 'Thêm giao dịch mới' : 'Chỉnh sửa giao dịch'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-gray-900">Ngày</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="bg-white border-gray-300"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-gray-900">Loại giao dịch</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-gray-700">Chi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-gray-700">Thu</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-900">Danh mục</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="hover:bg-gray-100">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-900">Số tiền (VND)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Nhập số tiền"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="bg-white border-gray-300"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">Mô tả</Label>
            <Input
              id="description"
              placeholder="Mô tả giao dịch"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-white border-gray-300"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-900">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú thêm..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-white border-gray-300"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                mode === 'add' ? 'Thêm giao dịch' : 'Cập nhật'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
