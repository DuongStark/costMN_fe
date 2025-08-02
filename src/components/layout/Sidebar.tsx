import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, X, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuItems, MenuItem } from "@/config/menu"
import { useIsMobile } from "@/hooks/use-mobile"

interface AdminSidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isCollapsed?: boolean
  onCollapse?: () => void
}

export function AdminSidebar({ 
  isOpen = false, 
  onToggle, 
  isCollapsed = false, 
  onCollapse 
}: AdminSidebarProps) {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const isMobile = useIsMobile()

  // Mở menu item hiện tại khi component mount
  useEffect(() => {
    const currentItem = menuItems.find(item => 
      location.pathname.startsWith(item.path) ||
      item.children?.some(sub => location.pathname.startsWith(sub.path))
    )
    if (currentItem && currentItem.children) {
      setExpandedItems([currentItem.path])
    }
  }, [location.pathname])

  // Mobile: luôn đóng sidebar khi navigation
  useEffect(() => {
    if (isMobile && onToggle) {
      onToggle()
    }
  }, [location.pathname, isMobile, onToggle])

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    )
  }

  const handleBackdropClick = () => {
    if (isMobile && onToggle) {
      onToggle()
    }
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.path)
    const isActive = location.pathname === item.path
    const hasSubmenu = item.children && item.children.length > 0
    const isParentActive = item.children?.some(sub => location.pathname === sub.path)

    return (
      <div key={item.path}>
        {hasSubmenu ? (
          <button
            onClick={() => toggleExpanded(item.path)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200",
              "hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
              (isActive || isParentActive) && "bg-blue-50 text-blue-700 border-l-4 border-blue-500",
              level > 0 && "ml-4 text-sm"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {item.icon}
              </div>
              <span className={cn(
                "font-medium transition-all duration-300",
                (isCollapsed && !isMobile) && "opacity-0 w-0 overflow-hidden",
                "sidebar-collapsed-text"
              )}>
                {item.label}
              </span>
            </div>
            <div className={cn(
              "transition-all duration-300",
              (isCollapsed && !isMobile) && "opacity-0 w-0 overflow-hidden",
              "sidebar-collapsed-text"
            )}>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>
        ) : (
          <Link
            to={item.path}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
              "hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
              isActive && "bg-blue-50 text-blue-700 border-l-4 border-blue-500",
              level > 0 && "ml-4 text-sm"
            )}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              {item.icon}
            </div>
            <span className={cn(
              "font-medium transition-all duration-300",
              (isCollapsed && !isMobile) && "opacity-0 w-0 overflow-hidden",
              "sidebar-collapsed-text"
            )}>
              {item.label}
            </span>
          </Link>
        )}

        {/* Submenu */}
        {hasSubmenu && isExpanded && (
          <div className={cn(
            "ml-6 mt-1 space-y-1 transition-all duration-300",
            (isCollapsed && !isMobile) && "opacity-0 w-0 overflow-hidden",
            "sidebar-collapsed-text"
          )}>
            {item.children!.map(subItem => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Mobile overlay backdrop
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={handleBackdropClick}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300",
            "md:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="font-bold text-gray-900">Cost Management</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div
      className={cn(
        "hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        "sidebar",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CM</span>
          </div>
          <span className={cn(
            "font-bold text-gray-900 transition-all duration-300",
            isCollapsed && "opacity-0 w-0 overflow-hidden",
            "sidebar-collapsed-text"
          )}>
            Cost Management
          </span>
        </div>
        
        {/* Collapse Button */}
        <button
          onClick={onCollapse}
          className={cn(
            "p-1 rounded-lg hover:bg-gray-100 transition-all duration-300",
            isCollapsed && "opacity-0 w-0 overflow-hidden",
            "sidebar-collapsed-text"
          )}
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <ChevronLeft className={cn(
            "w-5 h-5 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Expand Button when collapsed */}
      {isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onCollapse}
            className="w-full p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            title="Mở rộng sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
