const API_BASE_URL = 'https://costmn-be.onrender.com'

export interface Transaction {
  _id: string
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  notes?: string
}

export interface TransactionFilters {
  type?: string
  category?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface StatsData {
  totalIncome: number
  totalExpenses: number
  averageDaily: number
  comparisonPercentage: number
}

export interface CategoryData {
  _id: string
  total: number
}

export interface DailyData {
  _id: number
  total: number
}

export interface BudgetJar {
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

export interface Budget {
  _id?: string
  userId: string
  month: number
  year: number
  totalBudget: number
  jars: BudgetJar[]
  isCompleted: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BudgetStats {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalCarryOver: number
  jars: BudgetJar[]
}

export interface BudgetCompletionResult {
  success: boolean
  message: string
  completedBudget: Budget
  nextBudget?: Budget
  gap?: {
    monthsDiff: number
    suggestion: {
      current: { month: number, year: number }
      next: { month: number, year: number }
    }
  }
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API functions
export const api = {
  // Get transactions with filters
  async getTransactions(filters: TransactionFilters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value)
        }
      })

      const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transactions')
      }
      
      return data.data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Create new transaction
  async createTransaction(transaction: Omit<Transaction, '_id'>) {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create transaction')
      }
      
      return data.data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Update transaction
  async updateTransaction(id: string, transaction: Partial<Transaction>) {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update transaction')
      }
      
      return data.data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Delete transaction
  async deleteTransaction(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete transaction')
      }
      
      return data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Get overview stats
  async getOverviewStats(): Promise<StatsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/stats/overview`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch overview stats')
      }
      
      return data.data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Get category stats
  async getCategoryStats(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/stats/category`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch category stats')
      }
      
      return data.data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Get daily stats
  async getDailyStats(): Promise<DailyData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/stats/daily`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch daily stats')
      }
      
      return data.data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Debug endpoint
  async getDebugInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/debug`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Debug API Error:', error)
      throw error
    }
  },

  // Budget API functions
  // Get current budget
  async getCurrentBudget(month?: number, year?: number): Promise<Budget> {
    try {
      const params = new URLSearchParams()
      if (month) params.append('month', month.toString())
      if (year) params.append('year', year.toString())

      const response = await fetch(`${API_BASE_URL}/budget/current?${params}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch current budget')
      }
      
      return data.budget
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Create or update budget
  async createOrUpdateBudget(budgetData: {
    month: number
    year: number
    totalBudget: number
    jars: Omit<BudgetJar, '_id' | 'remaining' | 'percentage'>[]
  }): Promise<Budget> {
    try {
      const response = await fetch(`${API_BASE_URL}/budget`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(budgetData),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create/update budget')
      }
      
      return data.budget
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Get budget stats
  async getBudgetStats(month?: number, year?: number): Promise<BudgetStats> {
    try {
      const params = new URLSearchParams()
      if (month) params.append('month', month.toString())
      if (year) params.append('year', year.toString())

      const response = await fetch(`${API_BASE_URL}/budget/stats?${params}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch budget stats')
      }
      
      return data.stats
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Get budget history
  async getBudgetHistory(year?: number): Promise<Budget[]> {
    try {
      const params = new URLSearchParams()
      if (year) params.append('year', year.toString())

      const response = await fetch(`${API_BASE_URL}/budget/history?${params}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch budget history')
      }
      
      return data.budgets
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Complete budget month
  async completeBudgetMonth(month: number, year: number): Promise<BudgetCompletionResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/budget/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ month, year }),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to complete budget month')
      }
      
      return data
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Complete budget with gap handling
  async completeWithGap(
    month: number, 
    year: number, 
    action: 'create_current' | 'create_next' | 'skip',
    targetMonth?: number,
    targetYear?: number
  ): Promise<{ completedBudget: Budget; nextBudget?: Budget }> {
    try {
      const response = await fetch(`${API_BASE_URL}/budget/complete-gap`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ month, year, action, targetMonth, targetYear }),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to complete budget with gap')
      }
      
      return {
        completedBudget: data.completedBudget,
        nextBudget: data.nextBudget
      }
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Get pending budgets (incomplete months)
  async getPendingBudgets(): Promise<Budget[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/budget/pending`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pending budgets')
      }
      
      return data.budgets
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },

  // Get smart budget (latest active budget)
  async getSmartBudget(): Promise<{ budget: Budget | null, pendingBudgets: Budget[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/budget/smart`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch smart budget')
      }
      
      return {
        budget: data.budget,
        pendingBudgets: data.pendingBudgets || []
      }
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa.')
      }
      throw error
    }
  },
} 