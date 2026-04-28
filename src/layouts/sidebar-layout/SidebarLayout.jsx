'use client'

import { useState } from 'react'
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
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Logo } from '../../components/ui/atoms/logo/Logo'
import { Link, useLocation } from 'react-router-dom'


const teams = [
//   { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
//   { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
//   { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SidebarLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: location?.pathname?.includes('dashboard') },
  { name: 'Visitors', href: '/visitors', icon: UsersIcon, current: location?.pathname?.includes('visitors')  },
//   { name: 'Projects', href: '#', icon: FolderIcon, current: false },
//   { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
//   { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
//   { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
]

  return (
    <>
      <div>
        {/* MOBILE SIDEBAR */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop className="fixed inset-0 bg-gray-900/80" />

          <div className="fixed inset-0 flex">
            <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5">
                  <button onClick={() => setSidebarOpen(false)}>
                    <XMarkIcon className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 dark:bg-gray-900">
                <div className="flex h-16 items-center">
                 <Logo />
                </div>

                <nav className="flex flex-1 flex-col">
                  <ul className="space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link to={item?.href} className="flex gap-x-3 p-2 text-sm font-semibold">
                          <item.icon className="size-6" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* DESKTOP SIDEBAR */}
        <div
          className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex ${
            collapsed ? 'lg:w-20' : 'lg:w-72'
          } lg:flex-col transition-all duration-300`}
        >
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-3 pb-4 dark:bg-gray-900">
            
            {/* LOGO + TOGGLE */}
            <div className="flex h-16 items-center justify-between">
              {!collapsed && (
                <Logo />
              )}

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {collapsed ? (
                  <ChevronRightIcon className="size-5" />
                ) : (
                  <ChevronLeftIcon className="size-5" />
                )}
              </button>
            </div>

            {/* NAV */}
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-4">
                <li>
                  <ul className="space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                           <Link to={item?.href} 
                          title={item.name}
                          className={classNames(
                            'group flex items-center rounded-md p-2 text-sm font-semibold',
                            collapsed ? 'justify-center' : 'gap-x-3',
                            item.current
                              ? 'bg-gray-100 text-indigo-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <item.icon className="size-6 shrink-0" />
                          {!collapsed && item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* TEAMS */}
                <li>
                  {/* {!collapsed && (
                    <div className="text-xs font-semibold text-gray-400">Your teams</div>
                  )} */}
                  <ul className="mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.id}>
                        <a
                          title={team.name}
                          className={classNames(
                            'flex items-center rounded-md p-2 text-sm font-semibold',
                            collapsed ? 'justify-center' : 'gap-x-3'
                          )}
                        >
                          <span className="flex size-6 items-center justify-center rounded-lg border text-xs">
                            {team.initial}
                          </span>
                          {!collapsed && team.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* SETTINGS */}
                <li className="mt-auto">
                  <a
                    title="Settings"
                    className={classNames(
                      'flex items-center rounded-md p-2 text-sm font-semibold',
                      collapsed ? 'justify-center' : 'gap-x-3'
                    )}
                  >
                    <Cog6ToothIcon className="size-6" />
                    {!collapsed && 'Settings'}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={collapsed ? 'lg:pl-20' : 'lg:pl-72'}>
          <div className="sticky top-0 z-40 flex h-16 items-center border-b border-[#ccc] bg-white px-4 ">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Bars3Icon className="size-6" />
            </button>

            <div className="flex flex-1 justify-end items-center gap-x-4">
              <BellIcon className="size-6" />

              <Menu as="div" className="relative">
                <MenuButton>
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                    className="size-8 rounded-full"
                  />
                </MenuButton>

                <MenuItems className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md">
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      <a className="block px-3 py-2 text-sm hover:bg-gray-100">
                        {item.name}
                      </a>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          </div>

          <main className="py-10 px-6">{children}</main>
        </div>
      </div>
    </>
  )
}