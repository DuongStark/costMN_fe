import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { ChevronDown, ChevronRight, X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuItems, MenuItem } from "@/config/menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "../ui/button"

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
  isCollapsed?: boolean
  onSetCollapsed?: (collapsed: boolean) => void
}

export function AdminSidebar({ isOpen, onToggle, isCollapsed = false, onSetCollapsed }: AdminSidebarProps) {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isMenuOpen = (label: string) => openMenus.includes(label)

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = isActiveRoute(item.path)
    const hasChildren = item.children && item.children.length > 0
    const isOpen = isMenuOpen(item.label)

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
              "hover:bg-pink-100/70 text-pink-800",
              isActive && "bg-pink-200/80 text-pink-900 font-medium",
              isCollapsed && !isMobile && "justify-center px-2"
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {(!isCollapsed || isMobile) && (
                <span className="font-medium">{item.label}</span>
              )}
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-shrink-0">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </button>
          
          {isOpen && (!isCollapsed || isMobile) && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={isMobile ? onToggle : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
          "hover:bg-pink-100/70 text-pink-800",
          isActive ? "bg-pink-200/80 text-pink-900 font-medium" : "",
          isCollapsed && !isMobile && "justify-center px-2",
          depth > 0 && "ml-2"
        )}
      >
        {item.icon}
        {(!isCollapsed || isMobile) && (
          <span className="font-medium">{item.label}</span>
        )}
      </Link>
    )
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onToggle}
        />
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-pink-50 to-rose-50 border-r border-pink-200 shadow-xl z-50 transform transition-all duration-300 ease-in-out md:hidden",
          "will-change-transform touch-none backface-hidden",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-pink-200">
            <h2 className="text-lg font-bold text-pink-900">Chi Tiêu MN</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-pink-700 hover:bg-pink-100/70"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className={cn(
      "h-full bg-gradient-to-b from-pink-50 to-rose-50 border-r border-pink-200 shadow-sm transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-pink-200">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-pink-900">Chi Tiêu MN</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetCollapsed?.(!isCollapsed)}
          className="text-pink-700 hover:bg-pink-100/70"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>
      
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  )
}

export default AdminSidebar
