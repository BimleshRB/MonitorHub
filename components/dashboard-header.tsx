'use client';

import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthCheck } from '@/hooks/use-auth-check';

interface User {
  role: 'USER' | 'ADMIN';
  email: string;
  name: string;
}

interface DashboardHeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function DashboardHeader({ title = 'Dashboard', showSearch = true }: DashboardHeaderProps) {
  const router = useRouter();
  const { user } = useAuthCheck();
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    if (user?.name) {
      setInitials(user.name[0]);
    }
  }, [user]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    fetch('/api/logout', { method: 'GET' }).finally(() => {
      router.push('/login');
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-20 items-center justify-between px-8 gap-6">
        <div className="flex-1 max-w-xl hidden md:block">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search monitors, teams..."
                className="pl-10 bg-secondary/60 border-border/50 hover:border-border/70 focus-visible:ring-accent/50 h-10"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 h-10 w-10">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full bg-accent/20 hover:bg-accent/30 text-accent font-semibold"
              >
                {initials}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-2 p-3">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <div className="pt-1">
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded">{user?.role === 'ADMIN' ? 'Admin' : 'User'}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-3 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
