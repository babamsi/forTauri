'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { navItems, adminNavItems } from '@/constants/data';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const item = localStorage.getItem('userStore');
  const parsedItems = item ? JSON.parse(item) : null;
  const role = parsedItems?.role;
  return (
    <nav
      className={cn(`relative hidden h-screen w-72 border-r pt-16 lg:block`)}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              Overview
            </h2>
            {role === 'admin' ? (
              <DashboardNav items={adminNavItems} />
            ) : (
              <DashboardNav items={navItems} />
            )}
            {/* <DashboardNav items={navItems} /> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
