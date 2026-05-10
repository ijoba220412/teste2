import React from 'react';

interface TableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T | string;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, any>>({ 
  data, 
  columns, 
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  className = ''
}: TableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-12 text-teal-600 font-bold uppercase ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-teal-100 ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-teal-50 to-teal-100 border-b-2 border-teal-200">
            {columns.map((column) => (
              <th 
                key={String(column.key)}
                className="px-6 py-4 text-left text-xs font-black text-teal-800 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-teal-50">
          {data.map((item, index) => (
            <tr 
              key={index}
              onClick={() => onRowClick?.(item)}
              className={`
                hover:bg-teal-50 transition-colors cursor-pointer
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
            >
              {columns.map((column) => {
                const value = typeof column.key === 'string' 
                  ? (item as any)[column.key] 
                  : column.key(item);
                
                return (
                  <td 
                    key={String(column.key)}
                    className="px-6 py-4 text-sm text-teal-900 font-semibold uppercase whitespace-nowrap"
                  >
                    {column.render ? column.render(value, item) : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
