import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "./Sidebar"
import { BreadcrumbHeader } from "./Header"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  // Auto collapse on tablet
  useEffect(() => {
    if (isTablet && !isMobile) {
      setSidebarCollapsed(true)
    } else if (!isTablet && !isMobile) {
      setSidebarCollapsed(false)
    }
  }, [isTablet, isMobile])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-blue-50">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onCollapse={toggleCollapse}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BreadcrumbHeader onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-blue-50 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

