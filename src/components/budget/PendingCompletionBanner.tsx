import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Calendar, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { api, Budget } from '@/lib/api'

interface PendingCompletionBannerProps {
  pendingBudgets: Budget[]
  onBudgetCompleted: () => void
  onGapDetected?: (gapInfo: any, budget: Budget) => void
}

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

export default function PendingCompletionBanner({ 
  pendingBudgets, 
  onBudgetCompleted,
  onGapDetected
}: PendingCompletionBannerProps) {
  const [completingBudgets, setCompletingBudgets] = useState<Set<string>>(new Set())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleCompleteBudget = async (budget: Budget) => {
    if (!budget._id) return

    try {
      setCompletingBudgets(prev => new Set(prev).add(budget._id!))
      
      const result = await api.completeBudgetMonth(budget.month, budget.year)
      
      if (result.gap && onGapDetected) {
        // Có gap, gọi callback để parent xử lý gap dialog
        onGapDetected(result.gap, budget)
      } else {
        // Không có gap, hoàn thành bình thường
        toast.success(`Đã hoàn thành ${months[budget.month - 1]} ${budget.year}`)
        onBudgetCompleted()
      }
    } catch (error) {
      console.error('Error completing budget:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi hoàn thành budget')
    } finally {
      setCompletingBudgets(prev => {
        const newSet = new Set(prev)
        newSet.delete(budget._id!)
        return newSet
      })
    }
  }

  if (pendingBudgets.length === 0) {
    return null
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-orange-900">
                Bạn có {pendingBudgets.length} tháng chưa hoàn thành
              </h4>
              <p className="text-sm text-orange-700">
                Hoàn thành các tháng này để chúng xuất hiện trong lịch sử và chuyển tiếp số dư sang tháng mới
              </p>
            </div>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingBudgets.map((budget) => {
              const totalRemaining = budget.jars.reduce((sum, jar) => sum + (jar.budgetAmount - jar.spent), 0)
              const isCompleting = completingBudgets.has(budget._id!)
              
              return (
                <div 
                  key={budget._id} 
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-orange-700">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {months[budget.month - 1]} {budget.year}
                      </span>
                    </div>
                    {totalRemaining > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800"
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(totalRemaining)} dư
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleCompleteBudget(budget)}
                    disabled={isCompleting}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isCompleting ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Hoàn thành</span>
                      </div>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
