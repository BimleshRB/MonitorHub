'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Eye, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Users, 
  Activity,
  Bell,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthCheck } from '@/hooks/use-auth-check';

interface User {
  role: 'USER' | 'ADMIN';
  email: string;
  name: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuthCheck();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    fetch('/api/logout', { method: 'GET' }).finally(() => {
      router.push('/login');
    });
  };

  if (loading || !user) return null;

  const isAdmin = user.role === 'ADMIN';
  const baseUrl = isAdmin ? '/admin' : '';

  const userNavItems = [
    { 
      label: 'Home', 
      href: '/', 
      icon: Home,
      match: (path: string) => path === '/' 
    },
    { 
      label: 'Dashboard', 
      href: `${baseUrl}/dashboard`, 
      icon: LayoutDashboard,
      match: (path: string) => path === `${baseUrl}/dashboard` || path === `${baseUrl}/` 
    },
    { 
      label: 'Monitors', 
      href: `${baseUrl}/monitors`, 
      icon: Eye,
      match: (path: string) => path.startsWith(`${baseUrl}/monitors`) 
    },
    { 
      label: 'Incidents', 
      href: `${baseUrl}/incidents`, 
      icon: AlertTriangle,
      match: (path: string) => path.startsWith(`${baseUrl}/incidents`) 
    },
    { 
      label: 'Reports', 
      href: `${baseUrl}/reports`, 
      icon: BarChart3,
      match: (path: string) => path.startsWith(`${baseUrl}/reports`) 
    },
    { 
      label: 'Settings', 
      href: `${baseUrl}/settings`, 
      icon: Settings,
      match: (path: string) => path.startsWith(`${baseUrl}/settings`) 
    },
  ];

  const adminNavItems = [
    { 
      label: 'Home', 
      href: '/', 
      icon: Home,
      match: (path: string) => path === '/' 
    },
    { 
      label: 'Admin Overview', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard,
      match: (path: string) => path === '/admin/dashboard' || path === '/admin/'
    },
    { 
      label: 'Manage Users', 
      href: '/admin/users', 
      icon: Users,
      match: (path: string) => path.startsWith('/admin/users')
    },
    { 
      label: 'Manage Monitors', 
      href: '/admin/monitors', 
      icon: Eye,
      match: (path: string) => path.startsWith('/admin/monitors')
    },
    { 
      label: 'System Alerts', 
      href: '/admin/alerts', 
      icon: Bell,
      match: (path: string) => path.startsWith('/admin/alerts')
    },
    { 
      label: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      match: (path: string) => path.startsWith('/admin/settings')
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Activity className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground">MonitorHub</span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="px-2 py-3 rounded-lg bg-sidebar-accent">
          <p className="text-xs text-sidebar-foreground/70">Logged in as</p>
          <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.email}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent bg-transparent"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && !isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out z-40',
          isMobile && !isOpen && '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Content wrapper on desktop */}
      {!isMobile && (
        <div className="md:ml-64" />
      )}
    </>
  );
}
