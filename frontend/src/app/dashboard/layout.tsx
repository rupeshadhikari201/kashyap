"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  Menu,
  Shield,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applicants', href: '/dashboard/applicants', icon: Users },
  { name: 'Add Applicant', href: '/dashboard/add-applicant', icon: UserPlus },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = () => (
    <>
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-1 border-t pt-4">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.full_name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium capitalize">{user?.role?.replace('_', ' ')}</span>
                </div>
              </div>
              <NavItems />
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Applicant Management</h1>
          </div>
        </div>

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-64 flex-col border-r bg-card p-4 min-h-screen sticky top-0">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.full_name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium capitalize">{user?.role?.replace('_', ' ')}</span>
              </div>
            </div>
            <NavItems />
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}