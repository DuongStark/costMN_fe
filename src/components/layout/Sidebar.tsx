import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, X, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuItems, MenuItem } from "@/config/menu"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"

interface AdminSidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isCollapsed?: boolean
  onCollapse?: () => void
}

export function AdminSidebar({ isOpen = true, onToggle, isCollapsed = false, onCollapse }: AdminSidebarProps) {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  // Auto collapse on tablet
  useEffect(() => {
    if (isTablet && !isMobile && onCollapse) {
      onCollapse()
    }
  }, [isTablet, isMobile, onCollapse])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && onToggle) {
      onToggle()
    }
  }, [location.pathname, isMobile])

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
            "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer group hover:scale-105",
            isActive
              ? "bg-gradient-to-r from-pink-200 via-purple-200 to-rose-200 text-purple-800 border-2 border-purple-300 shadow-lg"
              : "text-purple-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 hover:text-purple-800 hover:shadow-md",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
        >
          {hasChildren ? (
            <>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center flex-1",
                  isCollapsed && !isMobile && "justify-center"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center min-w-0">
                  {item.icon}
                  {(!isCollapsed || isMobile) && <span className="ml-3 truncate">{item.label}</span>}
                </div>
              </Link>
              {(!isCollapsed || isMobile) && (
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
              )}
            </>
          ) : (
            <Link
              to={item.path}
              className={cn(
                "flex items-center w-full min-w-0",
                isCollapsed && !isMobile && "justify-center"
              )}
              title={isCollapsed && !isMobile ? item.label : undefined}
            >
              <div className="flex items-center min-w-0">
                {item.icon}
                {(!isCollapsed || isMobile) && <span className="ml-3 truncate">{item.label}</span>}
              </div>
            </Link>
          )}
        </div>

        {/* Submenu */}
        {hasChildren && isExpanded && (!isCollapsed || isMobile) && (
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
                    <span className="ml-3 truncate">{childItem.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </li>
    )
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
            onClick={onToggle}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-rose-50 via-pink-50 via-purple-50 to-blue-50 border-r-2 border-purple-200 flex flex-col shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b-2 border-purple-200 bg-gradient-to-r from-pink-100 to-purple-100">
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CostMN
            </h1>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-purple-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-purple-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map(renderMenuItem)}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-2 border-purple-200 bg-gradient-to-r from-pink-100 to-purple-100">
            <div className="text-xs text-purple-600 text-center font-medium">
              © 2025 CostMN
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className={cn(
      "hidden lg:flex bg-gradient-to-b from-rose-50 via-pink-50 via-purple-50 to-blue-50 border-r-2 border-purple-200 flex-col shadow-xl sidebar transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo & Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b-2 border-purple-200 bg-gradient-to-r from-pink-100 to-purple-100">
        {!isCollapsed && (
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            CostMN
          </h1>
        )}
        <button
          onClick={onCollapse}
          className="p-2 hover:bg-purple-200 rounded-lg transition-colors ml-auto"
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 text-purple-600 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1.5">
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-purple-200 bg-gradient-to-r from-pink-100 to-purple-100">
          <div className="text-xs text-purple-600 text-center font-medium">
            © 2025 CostMN
          </div>
        </div>
      )}
    </div>
  )
}