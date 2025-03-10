import React, { useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

const Table = ({ data, columns, title, placeholder }) => {
    const [sorting, setSorting] = useState([]);
    const [filtering, setFiltering] = useState('');

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting: sorting,
            globalFilter: filtering,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setFiltering,
    });

    // const renderMobileCard = (row) => {
    //     return (
    //         <div key={row.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4 mb-4 rounded-lg shadow">
    //             {columns.map((column) => (
    //                 <div key={column.accessorKey} className="mb-2">
    //                     <span className="font-medium text-gray-900 dark:text-white">{column.header}: </span>
    //                     {column.accessorKey === 'avatar' ? (
    //                         <div className='w-14 h-14'>
    //                             <img
    //                                 src={row.getValue(column.accessorKey)}
    //                                 alt='avatar'
    //                                 className='w-full h-full object-cover rounded-full'
    //                             />
    //                         </div>
    //                     ) : (
    //                         <span className="text-gray-700 dark:text-gray-300">
    //                             {column.accessorKey === 'status' ? (
    //                                 <span className={`${row.getValue(column.accessorKey) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'} text-xs font-medium me-2 px-2.5 py-0.5 rounded`}>
    //                                     {row.getValue(column.accessorKey) === true ? 'Active' : 'Inactive'}
    //                                 </span>
    //                             ) : (
    //                                 row.getValue(column.accessorKey)
    //                             )}
    //                         </span>
    //                     )}
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };

    return (
        <>
            <div className="relative overflow-x-auto">
                <div className='flex items-center justify-between'>
                    <h2 className='text-xl text-customDark dark:text-gray-200'>{title}</h2>
                    <div className='flex items-center justify-end space-x-3 my-3'>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder={placeholder}
                                value={filtering}
                                onChange={(e) => setFiltering(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop view - Hidden on mobile */}
                {/* <div className="hidden md:block overflow-x-auto mt-4"> */}
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className="px-3 py-3 border-b border-gray-200 dark:border-gray-600"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {
                                                        { asc: '🔼', desc: '🔽' }[
                                                        header.column.getIsSorted() ?? null
                                                        ]
                                                    }
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-600 bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-3 py-4 font-medium text-gray-900 dark:text-white">
                                            {cell.column.columnDef.accessorKey === 'avatar' ? (
                                                <div className='w-10 h-10'>
                                                    <img
                                                        src={`${API_URL}/${cell.getValue()}`}
                                                        alt='avatar'
                                                        className='w-full h-full object-cover rounded-full'
                                                    />
                                                </div>
                                            ) : (
                                                <span>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                                            )}

                                            {/* {cell.column.columnDef.accessorKey === 'status' && (
                                                <span className={` ${cell.getValue() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800  dark:bg-red-900 dark:text-red-300'} text-xs font-medium me-2 px-2.5 py-0.5 rounded`}>
                                                    {cell.getValue() === true ? 'Active' : 'Inactive'}
                                                </span>
                                            )} */}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view - Hidden on desktop */}
                {/* <div className="md:hidden mt-4">
                    {table.getRowModel().rows.map((row) => renderMobileCard(row))}
                    {table.getRowModel().rows.length === 0 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No data found
                        </div>
                    )}
                </div> */}

                {/* Pagination */}
                <div className='flex items-center justify-between my-3'>
                    <nav>
                        <ul className="flex items-center space-x-px h-8 text-sm">
                            <li>
                                <button
                                    className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<<'}
                                </button>
                            </li>
                            <li>
                                <button
                                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<'}
                                </button>
                            </li>
                            <li>
                                <button
                                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>'}
                                </button>
                            </li>
                            <li>
                                <button
                                    className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>>'}
                                </button>
                            </li>
                            <li>
                                <div className='flex space-x-3 ms-5 text-customDark dark:text-gray-400'>
                                    <span className="flex items-center gap-1">
                                        <div>Page</div>
                                        <strong>
                                            {table.getState().pagination.pageIndex + 1} of{' '}
                                            {table.getPageCount()}
                                        </strong>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        | Go to page:
                                        <input
                                            type="number"
                                            defaultValue={table.getState().pagination.pageIndex + 1}
                                            onChange={e => {
                                                const page = e.target.value ? Number(e.target.value) - 1 : 0
                                                table.setPageIndex(page)
                                            }}
                                            className="p-2 ps-2 w-12 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        />
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </nav>
                    <div>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value))
                            }}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    <span className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Show</span> {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Table;