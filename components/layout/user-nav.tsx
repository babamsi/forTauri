'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteAuthCookie } from '@/actions/auth.actions';
// import { signOut, useSession } from 'next-auth/react';

interface UserStoreItem {
  // Define the structure of your stored items
  id: string;
  name: string;
  username: string;
  role: string;
  // Add other properties as needed
}

export function UserNav() {
  const router = useRouter();
  const [items, setItems] = useState<UserStoreItem>();

  useEffect(() => {
    const storedItems = localStorage.getItem('userStore');
    if (storedItems) {
      try {
        const parsedItems: UserStoreItem = JSON.parse(storedItems);
        setItems(parsedItems);
      } catch (error) {
        console.error('Error parsing stored items:', error);
        // Handle the error (e.g., set items to an empty array or show an error message)
        setItems({ id: '', name: '', username: '', role: '' });
      }
    }
  }, []);
  // console.log(items)
  const handleLogout = useCallback(async () => {
    await deleteAuthCookie();
    router.replace('/');
  }, [router]);
  // const { data: session } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="https://github.com/shadcn.png"
              // alt={session.user?.name ?? ''}
            />
            {/* <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback> */}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {items?.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {items?.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
