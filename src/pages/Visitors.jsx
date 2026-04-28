import React from 'react'
import SidebarLayout from '../layouts/sidebar-layout/SidebarLayout'
import PageTitle from '../components/ui/molecules/PageTitle'
import VisitorsTable from './visitor-components/VisitorsList'

const Visitors = () => {
  return (
    <SidebarLayout>
         <PageTitle
              title="Visitors"
              path={[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Visitors', href: '/' },
              ]}
            />
            <div className='my-5'>
                <VisitorsTable />
            </div>
    </SidebarLayout>
  )
}

export default Visitors
