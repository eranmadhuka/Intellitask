import React from 'react'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout'

const InstructorDashboard = () => {
    return (
        <DashboardLayout>
            <div>
                <Breadcrumb
                    links={[
                        { text: 'Home', url: '/instructor' }
                    ]}
                />

                <h1 className='text-customDark font-semibold text-2xl dark:text-gray-300 mt-5'>Dashboard</h1>
                <p className='text-customGray text-sm'>Welcome to Learning Management Dashboard.</p>

            </div>
        </DashboardLayout>
    )
}

export default InstructorDashboard
