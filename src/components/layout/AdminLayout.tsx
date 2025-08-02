import { useState, useEffect, useCallback } from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "./Sidebar"
import { BreadcrumbHeader } from "./Header"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"

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

  // Fix iOS sidebar overflow issue
  useEffect(() => {
    if (isMobile) {
      if (sidebarOpen) {
        document.body.style.overflowX = 'hidden'
        // Prevent body scroll when sidebar is open
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflowX = ''
        document.body.style.overflow = ''
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflowX = ''
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, isMobile])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  return (
    <div className="flex h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-blue-50">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onSetCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BreadcrumbHeader onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-blue-50 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

