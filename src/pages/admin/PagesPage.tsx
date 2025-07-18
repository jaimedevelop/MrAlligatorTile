import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Search, Loader2, Tag, Filter } from 'lucide-react';
import { PageContent, PageType } from '../../types/types';
import { usePages, useDeletePage } from '../../services/pagesService';

const columnHelper = createColumnHelper<PageContent>();

const typeLabels: Record<PageType, string> = {
  page: 'Page',
  card: 'Card'
};

export default function PagesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<PageType | 'all'>('all');
  const { data: pages = [], isLoading } = usePages();
  const { mutate: deletePage } = useDeletePage();

  const filteredPages = pages.filter(page => {
    // Use optional chaining and nullish coalescing for safer access
    const titleMatch = page?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const seoTitleMatch = page?.seo?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchesSearch = titleMatch || seoTitleMatch;
    const matchesType = typeFilter === 'all' || page?.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns = [
    columnHelper.accessor('title', {
      header: 'Page Title',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          info.getValue() === 'page' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          <Tag className="w-3 h-3 mr-1" />
          {typeLabels[info.getValue()]}
        </span>
      ),
    }),
    columnHelper.accessor('seo.title', {
      header: 'SEO Title',
      cell: info => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/pages/${row.original.id}`)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this page?')) {
                deletePage(row.original.id);
              }
            }}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredPages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pages Management</h1>
        <button
          onClick={() => navigate('/admin/pages/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
        >
          <Plus className="w-4 h-4" />
          Create New Page
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PageType | 'all')}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="page">Pages</option>
                <option value="card">Cards</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}