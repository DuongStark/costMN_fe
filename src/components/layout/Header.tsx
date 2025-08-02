import { Fragment } from "react"
import { useLocation, Link } from "react-router-dom"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  path: string
  icon?: React.ReactNode
}

interface BreadcrumbHeaderProps {
  onMenuToggle?: () => void
}

export function BreadcrumbHeader({ onMenuToggle }: BreadcrumbHeaderProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()

  const handleLogout = () => {
    logout()
    toast.success('Đăng xuất thành công!')
  }

  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    let currentPath = ''
    
    segments.forEach((segment) => {
      currentPath += `/${segment}`
      
      const menuItem = findMenuItemByPath(currentPath)
      if (menuItem) {
        breadcrumbs.push({
          label: menuItem.label,
          path: currentPath,
          icon: menuItem.icon
        })
      } else {
        // If not found in menu, format the segment
        breadcrumbs.push({
          label: formatBreadcrumbLabel(segment),
          path: currentPath
        })
      }
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs(location.pathname)

  return (
    <header className={cn(
      "flex shrink-0 items-center gap-2 transition-[width,height] ease-linear bg-gradient-to-r from-rose-50 via-pink-50 via-purple-50 to-blue-50 border-b-2 border-purple-200 shadow-lg backdrop-blur-sm",
      // Mobile optimizations with safe area
      isMobile ? "h-14 px-3" : "h-16 px-4",
      // Safe area support for iPhone X+
      isMobile && "pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]",
      // Adjust height for safe area
      isMobile && "h-[max(3.5rem,calc(3.5rem+env(safe-area-inset-top)))]"
    )}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Mobile Menu Button - Enhanced with safe area */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className={cn(
              "lg:hidden hover:bg-gradient-to-br hover:from-pink-100 hover:to-purple-100 rounded-lg",
              "min-h-[44px] min-w-[44px] p-2" // iOS recommended touch target 44px
            )}
          >
            <Menu className="h-5 w-5 text-purple-600" />
          </Button>
        )}
        
        {/* Breadcrumb - Mobile optimized */}
        <Breadcrumb className="flex-1 min-w-0">
          <BreadcrumbList className={cn(
            isMobile && "text-sm" // Smaller text on mobile
          )}>
            {breadcrumbs.map((item, index) => (
              <Fragment key={item.path}>
                <BreadcrumbItem className="min-w-0">
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className={cn(
                      "text-purple-800 font-semibold truncate",
                      isMobile && "text-sm max-w-[120px]" // Limit width on mobile
                    )}>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        to={item.path} 
                        className={cn(
                          "text-purple-600 hover:text-purple-800 transition-colors font-medium truncate",
                          isMobile && "text-sm max-w-[80px]" // Limit width on mobile
                        )}
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="text-purple-400" />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center gap-2">
        {/* User Menu - Mobile optimized */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "relative rounded-full hover:bg-gradient-to-br hover:from-pink-100 hover:to-purple-100",
                isMobile ? "h-8 w-8 p-0 min-h-[44px] min-w-[44px]" : "h-8 w-8" // iOS touch target
              )}
            >
              <Avatar className={cn(isMobile ? "h-7 w-7" : "h-8 w-8")}>
                <AvatarImage src={user?.avatar} alt={user?.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-purple-800 border-2 border-purple-300 font-semibold text-sm">
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-purple-200 shadow-xl" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className={cn(
                  "font-semibold leading-none text-purple-800",
                  isMobile ? "text-sm" : "text-sm"
                )}>{user?.fullName}</p>
                <p className={cn(
                  "leading-none text-purple-600",
                  isMobile ? "text-xs" : "text-xs"
                )}>
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-purple-200" />
            <DropdownMenuItem className="text-purple-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 hover:text-purple-800 font-medium">
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-purple-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 hover:text-purple-800 font-medium">
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-purple-200" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 hover:text-red-700 font-medium">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function findMenuItemByPath(path: string) {
  const menuItems = [
    { label: "Trang chủ", path: "/dashboard", icon: null },
    { label: "Lịch sử giao dịch", path: "/transactions", icon: null },
  ]
  
  return menuItems.find(item => item.path === path)
}

function formatBreadcrumbLabel(segment: string): string {
  // Convert kebab-case or snake_case to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}