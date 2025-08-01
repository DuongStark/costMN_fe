import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

interface GapCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  completingMonth: number
  completingYear: number
  currentMonth: number
  currentYear: number
  monthsDiff: number
  onConfirm: (action: 'create_current' | 'create_next' | 'skip', targetMonth?: number, targetYear?: number) => void
}

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

export default function GapCompletionDialog({
  open,
  onOpenChange,
  completingMonth,
  completingYear,
  currentMonth,
  currentYear,
  monthsDiff,
  onConfirm
}: GapCompletionDialogProps) {
  const [selectedAction, setSelectedAction] = useState<'create_current' | 'create_next' | 'skip'>('create_current')

  const nextMonth = completingMonth === 12 ? 1 : completingMonth + 1
  const nextYear = completingMonth === 12 ? completingYear + 1 : completingYear

  const handleConfirm = () => {
    if (selectedAction === 'create_current') {
      onConfirm(selectedAction, currentMonth, currentYear)
    } else if (selectedAction === 'create_next') {
      onConfirm(selectedAction, nextMonth, nextYear)
    } else {
      onConfirm(selectedAction)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Phát hiện khoảng cách thời gian
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              Bạn đang hoàn thành <strong>{months[completingMonth - 1]} {completingYear}</strong> vào thời điểm hiện tại ({months[currentMonth - 1]} {currentYear}). 
              Có <strong>{monthsDiff} tháng</strong> chênh lệch.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-medium">Bạn muốn tạo ngân sách cho tháng nào?</p>

            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="create_current"
                  checked={selectedAction === 'create_current'}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Tháng hiện tại ({months[currentMonth - 1]} {currentYear})</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Tạo ngân sách cho tháng bạn đang sử dụng</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="create_next"
                  checked={selectedAction === 'create_next'}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  className="w-4 h-4 text-green-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Tháng tiếp theo ({months[nextMonth - 1]} {nextYear})</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Tạo ngân sách theo thứ tự thời gian</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="skip"
                  checked={selectedAction === 'skip'}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  className="w-4 h-4 text-gray-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Chỉ hoàn thành, không tạo mới</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Tôi sẽ tự tạo ngân sách sau</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Hủy
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Xác nhận
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
