import { NavItem } from '@/types';

export type Products = {
  _id: string;
  name: string;
  description: string;
  price: Number;
  sellPrice: Number;
  addedBy: string;
  quantity: number;
  units: string;
  category: string;
  vendor: string;
  isQuantityBased: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};
export const users: User[] = [
  {
    id: 1,
    name: 'Candice Schiner',
    company: 'Dell',
    role: 'Frontend Developer',
    verified: false,
    status: 'Active'
  },
  {
    id: 2,
    name: 'John Doe',
    company: 'TechCorp',
    role: 'Backend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    company: 'WebTech',
    role: 'UI Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 4,
    name: 'David Smith',
    company: 'Innovate Inc.',
    role: 'Fullstack Developer',
    verified: false,
    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    company: 'TechGuru',
    role: 'Product Manager',
    verified: true,
    status: 'Active'
  },
  {
    id: 6,
    name: 'James Brown',
    company: 'CodeGenius',
    role: 'QA Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 7,
    name: 'Laura White',
    company: 'SoftWorks',
    role: 'UX Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 8,
    name: 'Michael Lee',
    company: 'DevCraft',
    role: 'DevOps Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 9,
    name: 'Olivia Green',
    company: 'WebSolutions',
    role: 'Frontend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 10,
    name: 'Robert Taylor',
    company: 'DataTech',
    role: 'Data Analyst',
    verified: false,
    status: 'Active'
  }
];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Products',
    href: '/dashboard/product',
    icon: 'cart',
    label: 'products'
  },
  {
    title: 'Employee',
    href: '/dashboard/employee',
    icon: 'employee',
    label: 'employee'
  },
  {
    title: 'Customers',
    href: '/dashboard/customermanager',
    icon: 'sold',
    label: 'customers'
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: 'order',
    label: 'orders'
  },
  {
    title: 'Suppliers',
    href: '/dashboard/suppliermanager',
    icon: 'supplier',
    label: 'suppliers'
  }
];

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Products',
    href: '/dashboard/product',
    icon: 'cart',
    label: 'products'
  },
  {
    title: 'POS',
    href: '/dashboard/pos',
    icon: 'pos',
    label: 'POS'
  },
  // {
  //   title: 'Refund',
  //   href: '/dashboard/refund',
  //   icon: 'refund',
  //   label: 'Refund'
  // },
  {
    title: 'Customer Manager',
    href: '/dashboard/customermanager',
    icon: 'sold',
    label: 'sold'
  },
  {
    title: 'Expanses',
    href: '/dashboard/expanses',
    icon: 'expanse',
    label: 'expanses'
  },
  {
    title: 'Suppliers',
    href: '/dashboard/suppliermanager',
    icon: 'supplier',
    label: 'suppliers'
  }
  // {
  //   title: 'Employee',
  //   href: '/dashboard/employee',
  //   icon: 'employee',
  //   label: 'employee'
  // },
  // {
  //   title: 'Profile',
  //   href: '/dashboard/profile',
  //   icon: 'profile',
  //   label: 'profile'
  // },
  // {
  //   title: 'Kanban',
  //   href: '/dashboard/kanban',
  //   icon: 'kanban',
  //   label: 'kanban'
  // },
  // {
  //   title: 'Login',
  //   href: '/',
  //   icon: 'login',
  //   label: 'login'
  // }
];
