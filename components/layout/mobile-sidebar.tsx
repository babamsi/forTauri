'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navItems, adminNavItems } from '@/constants/data';
import { MenuIcon } from 'lucide-react';
import { useState, useEffect, use } from 'react';

// import { Playlist } from "../data/playlists";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  // playlists: Playlist[];
}
interface UserStoreItem {
  // Define the structure of your stored items
  id: string;
  name: string;
  username: string;
  role: string;
  // Add other properties as needed
}

export function MobileSidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserStoreItem | null>(null);
  useEffect(() => {
    const savedValue = window.localStorage.getItem('count');
    setUser(JSON.parse(savedValue || '{}'));
  }, []);
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
                {user?.role === 'admin' ? (
                  <DashboardNav
                    items={adminNavItems}
                    isMobileNav={true}
                    setOpen={setOpen}
                  />
                ) : (
                  <DashboardNav
                    items={navItems}
                    isMobileNav={true}
                    setOpen={setOpen}
                  />
                )}
                {/* <DashboardNav
                  items={navItems}
                  isMobileNav={true}
                  setOpen={setOpen}
                /> */}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
