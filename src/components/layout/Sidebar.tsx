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
            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
            isActive
              ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 shadow-sm"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-800"
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
                className="p-1 hover:bg-gray-200 rounded"
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
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      isChildActive
                        ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-700"
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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">
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
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 Quản lý Chi tiêu
        </div>
      </div>
    </div>
  )
}