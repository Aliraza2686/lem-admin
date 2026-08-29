'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  CubeIcon,
  DocumentDuplicateIcon,
  NewspaperIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Logo } from '../../components/ui/atoms/logo/Logo'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleLogout } from '../../axios/instance'


const teams = [
  //   { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  //   { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  //   { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SidebarLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: location?.pathname?.includes('dashboard') },
    { name: 'Products', href: '/products', icon: CubeIcon, current: location?.pathname?.includes('products') },
    { name: 'Articles', href: '/articles', icon: NewspaperIcon, current: location?.pathname?.includes('articles') },
    { name: 'Visitors', href: '/visitors', icon: UsersIcon, current: location?.pathname?.includes('visitors') },
    { name: 'Profile', href: '/profile', icon: UserIcon, current: location?.pathname?.includes('profile') },
    //   { name: 'Projects', href: '#', icon: FolderIcon, current: false },
    //   { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
    //   { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
    //   { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
  ]

  const userNavigation = [
  { name: 'Your profile', href: '/profile', onClick: () => navigate('/profile') },
  { name: 'Sign out', href: '#', onClick: handleLogout },
]

  return (
    <>
      <div>
        {/* MOBILE SIDEBAR */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-primary-deep/70 backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transition duration-300 ease-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 transition-opacity duration-300 ease-in data-[closed]:opacity-0">
                  <button onClick={() => setSidebarOpen(false)}>
                    <XMarkIcon className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              <div className="glass-panel-dark flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 shadow-glass-lg">
                <div className="flex h-16 items-center">
                  <Logo />
                </div>

                <SidebarNav navigation={navigation} collapsed={false} />
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* DESKTOP SIDEBAR */}
        <div
          className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex ${collapsed ? 'lg:w-20' : 'lg:w-72'
            } lg:flex-col transition-all duration-300 ease-in-out`}
        >
          <div className="glass-panel-dark flex grow flex-col gap-y-5 overflow-y-auto px-3 pb-4 shadow-glass-lg">

            {/* LOGO + TOGGLE */}
            <div className="flex h-16 items-center justify-between">
              {!collapsed && (
                <Logo />
              )}

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="rounded-md p-1 text-white/60 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                {collapsed ? (
                  <ChevronRightIcon className="size-5" />
                ) : (
                  <ChevronLeftIcon className="size-5" />
                )}
              </button>
            </div>

            {/* NAV */}
            <SidebarNav navigation={navigation} collapsed={collapsed} teams={teams} />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={collapsed ? 'lg:pl-20' : 'lg:pl-72'}>
          <div className="glass-panel sticky top-0 z-40 flex h-16 items-center rounded-none border-x-0 border-t-0 px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 lg:hidden">
              <Bars3Icon className="size-6" />
            </button>

            <div className="flex flex-1 items-center justify-end gap-x-4">
              <button className="rounded-full p-1.5 text-gray-500 transition-colors duration-150 hover:bg-primary/5 hover:text-primary">
                <BellIcon className="size-5" />
              </button>

              <Menu as="div" className="relative">
                <MenuButton className="block rounded-full outline-none transition-shadow duration-200 focus-visible:shadow-glow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                    className="size-8 rounded-full ring-2 ring-primary/10"
                  />
                </MenuButton>

                <MenuItems
                  transition
                  className="glass-panel absolute right-0 mt-2 w-36 origin-top-right rounded-lg p-1 shadow-glass-md transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                  {userNavigation?.map((item) => (
                    <MenuItem key={item?.name} onClick={() => item?.onClick?.()}>
                      <div className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors duration-150 data-[focus]:bg-primary/5 data-[focus]:text-primary">
                        {item.name}
                      </div>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          </div>

          <main className="px-6 py-10">{children}</main>
        </div>
      </div>
    </>
  )
}

function SidebarNav({ navigation, collapsed, teams = [] }) {
  return (
    <nav className="flex flex-1 flex-col">
      <ul className="flex flex-1 flex-col gap-y-4">
        <li>
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name} className="relative">
                {item.current && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-md bg-white/10 shadow-glow-sm"
                  />
                )}
                <Link
                  to={item?.href}
                  title={item.name}
                  className={classNames(
                    'group relative z-10 flex items-center rounded-md p-2 text-sm font-semibold transition-colors duration-150',
                    collapsed ? 'justify-center' : 'gap-x-3',
                    item.current
                      ? 'text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                  )}
                >
                  <item.icon
                    className={classNames(
                      'size-6 shrink-0 transition-colors duration-150',
                      item.current && 'text-glow drop-shadow-[0_0_6px_rgba(79,209,255,0.6)]'
                    )}
                  />
                  {!collapsed && item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/* TEAMS */}
        {teams.length > 0 && (
          <li>
            <ul className="mt-2 space-y-1">
              {teams.map((team) => (
                <li key={team.id}>
                  <a
                    title={team.name}
                    className={classNames(
                      'flex items-center rounded-md p-2 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white/90',
                      collapsed ? 'justify-center' : 'gap-x-3'
                    )}
                  >
                    <span className="flex size-6 items-center justify-center rounded-lg border border-white/15 text-xs">
                      {team.initial}
                    </span>
                    {!collapsed && team.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        )}

        {/* SETTINGS */}
        <li className="mt-auto">
          <a
            title="Settings"
            className={classNames(
              'flex items-center rounded-md p-2 text-sm font-semibold text-white/60 transition-colors duration-150 hover:bg-white/5 hover:text-white/90',
              collapsed ? 'justify-center' : 'gap-x-3'
            )}
          >
            <Cog6ToothIcon className="size-6" />
            {!collapsed && 'Settings'}
          </a>
        </li>
      </ul>
    </nav>
  )
}