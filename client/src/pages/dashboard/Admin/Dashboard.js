import React from 'react'
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout'

const Dashboard = () => {
    return (
        <DashboardLayout>
            <div>
                <h1 className='text-customDark font-semibold text-2xl dark:text-gray-300 mt-5'>Admin Dashboard</h1>

                {/* Charts Section */}
                <div className='grid gap-6 xl:grid-cols-2 2xl:grid-cols-3'>
                    <div className='relative p-6 flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 overflow-hidden xl:col-span-2 shadow-sm dark:bg-gray-800'>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Earnings Overview</h3>
                        {/* <EarningsBarChart /> */}
                    </div>

                    <div className='relative p-6 flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-sm dark:bg-gray-800'>
                        {/* <RecentNotification /> */}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Dashboard;
