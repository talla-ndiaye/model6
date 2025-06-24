import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import SearchInput from '../ui/SearchInput';
import EmptyState from './EmptyState';

const DataTable = ({ 
  data = [],
  columns = [],
  searchable = true,
  sortable = true,
  paginated = true,
  itemsPerPage = 10,
  emptyStateProps = {},
  onRowClick,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage
  const filteredData = searchable && searchTerm
    ? data.filter(item =>
        columns.some(column => {
          const value = column.accessor ? item[column.accessor] : '';
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  // Tri
  const sortedData = sortable && sortConfig.key
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = paginated
    ? sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : sortedData;

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const enhancedColumns = sortable
    ? columns.map(column => ({
        ...column,
        header: (
          <button
            onClick={() => handleSort(column.accessor)}
            className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
          >
            <span>{column.header}</span>
            {sortConfig.key === column.accessor && (
              sortConfig.direction === 'asc' 
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )
      }))
    : columns;

  if (data.length === 0) {
    return <EmptyState {...emptyStateProps} />;
  }

  return (
    <div className={className}>
      {searchable && (
        <div className="mb-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Rechercher dans le tableau..."
          />
        </div>
      )}

      <Table
        columns={enhancedColumns}
        data={paginatedData}
        onRowClick={onRowClick}
      />

      {paginated && totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedData.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;