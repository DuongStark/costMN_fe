import { Outlet } from "react-router-dom"
import { AdminSidebar } from "./Sidebar"
import { BreadcrumbHeader } from "./Header"

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BreadcrumbHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

