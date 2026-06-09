import React from 'react'
import SidebarLayout from '../../layouts/sidebar-layout/SidebarLayout'
import { USER_KEY } from '../../globalV'
import PageTitle from '../../components/ui/molecules/PageTitle'

const Profile = () => {
  const user = JSON.parse(localStorage.getItem(USER_KEY))
  const firstLetter = user?.name.split('')[0]
  const lastLetter = user.name.split(' ')[1].split('')[0]
  return (
    <SidebarLayout>
      <PageTitle
        title="Profile"
        path={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Profile', href: '/' },
        ]}
      />


      <div className='bg-white shadow-md rounded-xl p-5 my-5'>
        <div className='flex gap-5'>
          <div className='w-32 h-32 bg-[#b695f8]/10 rounded-xl flex justify-center items-center'>
            <span className='text-2xl font-semibold'>
              {firstLetter} {lastLetter}
            </span>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='flex gap-2 items-center'>{user?.name}

              <span className='bg-red-900/10 text-red-900 capitalize text-sm px-2 py-1 rounded-xl'>{user?.role}</span>
            </span>
            <span className='text-gray-500 text-sm'>{user?.email}</span>
            <span className='text-gray-500 text-sm'>
              {new Date(user.createdAt).toLocaleString()}

            </span>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default Profile
