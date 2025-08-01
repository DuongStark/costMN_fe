import { ReactNode } from "react"
import { Home, List, PiggyBank, History } from "lucide-react"

export type MenuItem = {
  label: string
  path: string
  icon: ReactNode
  // Optional children for submenus
  children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  { label: "Thống kê", path: "/dashboard", icon: <Home size={16} /> },
  { label: "Lịch sử giao dịch", path: "/transactions", icon: <List size={16} /> },
  { 
    label: "Ngân sách hũ", 
    path: "/budget", 
    icon: <PiggyBank size={16} />,
    children: [
      { label: "Quản lý ngân sách", path: "/budget", icon: <PiggyBank size={16} /> },
      { label: "Lịch sử ngân sách", path: "/budget/history", icon: <History size={16} /> }
    ]
  },
]