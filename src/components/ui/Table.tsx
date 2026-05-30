'use client';

import { ReactNode } from 'react';

// ============================================================================
// TIPOS DO COMPONENTE TABLE
// ============================================================================

export interface TableColumn<T> {
  key: string | ((item: T) => ReactNode); // ✅ CORREÇÃO: union explícito
  header: string;
  className?: string;
  sortable?: boolean;
  render?: (value: ReactNode, item: T, index: number) => ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

// ============================================================================
// COMPONENTE TABLE
// ============================================================================

export default function Table<T extends { id?: string }>({
  data,
  columns,
  emptyMessage = 'NENHUM REGISTRO ENCONTRADO',
  className = '',
  onRowClick,
  loading = false,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-700 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold uppercase">CARREGANDO...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-gray-500 font-semibold uppercase">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal-700 text-white">
              <tr>
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, rowIndex) => {
                const rowKey = (item as any).id || rowIndex;
                
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(item)}
                    className={`${
                      onRowClick ? 'cursor-pointer hover:bg-teal-50 transition-colors' : ''
                    }`}
                  >
                    {columns.map((column, colIndex) => {
                      // ✅ CORREÇÃO PRINCIPAL: verifica se é função antes de chamar
                      let value: ReactNode;
                      
                      if (typeof column.key === 'function') {
                        value = column.key(item);
                      } else {
                        // Acesso seguro à propriedade por string
                        value = (item as Record<string, any>)[column.key];
                      }
                      
                      // Aplica render customizado se existir
                      if (column.render) {
                        value = column.render(value, item, rowIndex);
                      }
                      
                      return (
                        <td
                          key={colIndex}
                          className={`px-6 py-4 text-sm text-gray-700 uppercase ${column.className || ''}`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
