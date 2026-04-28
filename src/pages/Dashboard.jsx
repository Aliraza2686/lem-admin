import React from 'react'
import SidebarLayout from '../layouts/sidebar-layout/SidebarLayout'
import PageTitle from '../components/ui/molecules/PageTitle'

const Dashboard = () => {
  return (
    <SidebarLayout>
      <PageTitle
        title="Dashboard"
        path={[
          { name: 'Dashboard', href: '/' },
        ]}
      />
      
    </SidebarLayout>
  )
}

export default Dashboard
