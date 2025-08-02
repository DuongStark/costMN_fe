import { useState, useEffect, useCallback } from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "./Sidebar"
import { BreadcrumbHeader } from "./Header"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  // Initial state based on device type
  useEffect(() => {
    if (isMobile) {
      // Mobile: always closed by default
      setSidebarOpen(false)
      setSidebarCollapsed(false)
    } else if (isTablet) {
      // Tablet: open but collapsed
      setSidebarOpen(true)
      setSidebarCollapsed(true)
    } else {
      // Desktop: open and expanded
      setSidebarOpen(true)
      setSidebarCollapsed(false)
    }
  }, [isMobile, isTablet])

  // Fix iOS sidebar overflow issue and mobile optimizations
  useEffect(() => {
    if (isMobile) {
      if (sidebarOpen) {
        // Prevent background scroll when sidebar is open
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      } else {
        // Restore normal scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
    } else {
      // Ensure the style is removed on non-mobile devices
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [sidebarOpen, isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  return (
    <div className={cn(
      "flex h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-blue-50",
      isMobile && "relative", // Mobile specific positioning
      // iPhone safe area support
      "supports-[env(safe-area-inset-top)]:h-[100dvh]"
    )}>
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onSetCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BreadcrumbHeader onMenuToggle={toggleSidebar} />
        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-blue-50",
          // Mobile-first responsive padding with safe area
          isMobile ? "p-3" : "p-3 sm:p-4 lg:p-6",
          // Safe area padding for iPhone X+
          isMobile && "pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]"
        )}>
          <div className={cn(
            "mx-auto",
            isMobile ? "max-w-none" : "max-w-7xl"
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

