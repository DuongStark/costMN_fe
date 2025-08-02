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
              "w-full flex items-center justify-between text-sm rounded-xl transition-all duration-200",
              "hover:bg-pink-100/70 text-pink-800 active:scale-[0.98]",
              isActive && "bg-pink-200/80 text-pink-900 font-medium",
              isCollapsed && !isMobile && "justify-center px-2",
              // Mobile optimization - larger touch targets
              isMobile ? "px-4 py-3.5 min-h-[48px]" : "px-3 py-2.5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex-shrink-0",
                isMobile && "w-5 h-5" // Slightly larger icons on mobile
              )}>
                {item.icon}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className={cn(
                  "font-medium",
                  isMobile && "text-base" // Larger text on mobile
                )}>{item.label}</span>
              )}
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-shrink-0">
                {isOpen ? (
                  <ChevronDown className={cn("w-4 h-4", isMobile && "w-5 h-5")} />
                ) : (
                  <ChevronRight className={cn("w-4 h-4", isMobile && "w-5 h-5")} />
                )}
              </div>
            )}
          </button>
          
          {isOpen && (!isCollapsed || isMobile) && (
            <div className={cn(
              "mt-1 space-y-1",
              isMobile ? "ml-6" : "ml-4"
            )}>
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
          "flex items-center gap-3 text-sm rounded-xl transition-all duration-200",
          "hover:bg-pink-100/70 text-pink-800 active:scale-[0.98]",
          isActive ? "bg-pink-200/80 text-pink-900 font-medium" : "",
          isCollapsed && !isMobile && "justify-center px-2",
          depth > 0 && "ml-2",
          // Mobile optimization - larger touch targets and better spacing
          isMobile ? "px-4 py-3.5 min-h-[48px]" : "px-3 py-2.5"
        )}
      >
        <div className={cn(
          "flex-shrink-0",
          isMobile && "w-5 h-5" // Slightly larger icons on mobile
        )}>
          {item.icon}
        </div>
        {(!isCollapsed || isMobile) && (
          <span className={cn(
            "font-medium",
            isMobile && "text-base" // Larger text on mobile
          )}>{item.label}</span>
        )}
      </Link>
    )
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay - Enhanced with better blur and opacity */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden transition-all duration-300 ease-in-out",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}
          onClick={onToggle}
        />
        
        {/* Mobile Sidebar - Premium mobile experience with safe area */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-pink-50/95 to-rose-50/95 border-r border-pink-200/80 shadow-2xl z-50 transform transition-all duration-300 ease-out md:hidden",
          "backdrop-blur-xl supports-[backdrop-filter]:bg-pink-50/90", // Modern backdrop blur
          "will-change-transform touch-none backface-hidden", // Performance optimizations
          // Safe area support for iPhone X+
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
          "h-[100dvh] supports-[env(safe-area-inset-top)]:h-[100dvh]", // Dynamic viewport height
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        )}>
          {/* Mobile Header - More polished with safe area */}
          <div className={cn(
            "flex items-center justify-between border-b border-pink-200/80 bg-white/20 backdrop-blur-sm",
            "p-5 pt-[max(1.25rem,env(safe-area-inset-top))]" // Safe area for notch
          )}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MN</span>
              </div>
              <h2 className="text-lg font-bold text-pink-900">Chi Tiêu MN</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-pink-700 hover:bg-pink-100/70 rounded-lg p-2 min-h-[44px] min-w-[44px]" // iOS touch target
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Mobile Navigation - Enhanced touch targets with safe area */}
          <nav className={cn(
            "p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent",
            "h-[calc(100%-140px)] pb-[max(1rem,env(safe-area-inset-bottom))]" // Account for footer + safe area
          )}>
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
          
          {/* Mobile Footer - Add some branding with safe area */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 bg-white/20 backdrop-blur-sm border-t border-pink-200/80",
            "p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" // Safe area for home indicator
          )}>
            <p className="text-xs text-pink-600 text-center font-medium">
              Made with 💖 for smart financial management
            </p>
          </div>
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
