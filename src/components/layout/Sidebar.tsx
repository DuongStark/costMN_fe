import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuItems, MenuItem } from "@/config/menu"

export function AdminSidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    )
  }

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path
    const isExpanded = expandedItems.includes(item.path)
    const hasChildren = item.children && item.children.length > 0

    return (
      <li key={item.path}>
        <div
          className={cn(
            "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105",
            isActive
              ? "bg-gradient-to-r from-pink-200 via-purple-200 to-rose-200 text-purple-800 border-2 border-purple-300 shadow-lg"
              : "text-purple-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 hover:text-purple-800 hover:shadow-md"
          )}
        >
          {hasChildren ? (
            <>
              <Link
                to={item.path}
                className="flex items-center flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
              <button
                onClick={() => toggleExpanded(item.path)}
                className="p-1 hover:bg-purple-200 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </>
          ) : (
            <Link
              to={item.path}
              className="flex items-center w-full"
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          )}
        </div>

        {/* Submenu */}
        {hasChildren && isExpanded && (
          <ul className="ml-4 mt-2 space-y-1">
            {item.children?.map((childItem) => {
              const isChildActive = location.pathname === childItem.path
              
              return (
                <li key={childItem.path}>
                  <Link
                    to={childItem.path}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105",
                      isChildActive
                        ? "bg-gradient-to-r from-pink-200 via-purple-200 to-rose-200 text-purple-800 border-2 border-purple-300 shadow-lg"
                        : "text-purple-600 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 hover:text-purple-800 hover:shadow-md"
                    )}
                  >
                    <span className="w-4 h-4 mr-3" />
                    {childItem.icon}
                    <span className="ml-3">{childItem.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="w-64 bg-gradient-to-b from-rose-50 via-pink-50 via-purple-50 to-blue-50 border-r-2 border-purple-200 flex flex-col shadow-xl sidebar">
      {/* Logo */}
      <div className="p-6 border-b-2 border-purple-200 bg-gradient-to-r from-pink-100 to-purple-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quản lý Chi tiêu
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t-2 border-purple-200 bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="text-xs text-purple-600 text-center font-medium">
          © 2025 Quản lý Chi tiêu
        </div>
      </div>
    </div>
  )
}