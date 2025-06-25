// components/ui/Table.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { colors } from '@/lib/colors';

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: Record<string, unknown>) => void;
  className?: string;
  maxHeight?: string; // New prop to control scroll height
  scrollThreshold?: number; // New prop to control when scrolling starts
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'មិនមានទិន្នន័យ',
  emptyIcon,
  onRowClick,
  className = '',
  maxHeight = 'max-h-96', // Default scroll height
  scrollThreshold = 7 // Default threshold for scrolling
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.primary[500] }} />
        <span className="ml-2" style={{ color: colors.secondary[600] }}>កំពុងទាញយកទិន្នន័យ...</span>
      </div>
    );
  }

  const shouldScroll = data.length >= scrollThreshold;

  return (
    <div className={className}>
      {/* Scrollable container */}
      <div 
        className={`overflow-x-auto ${shouldScroll ? `${maxHeight} overflow-y-auto` : ''}`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.secondary[400]} ${colors.secondary[100]}`,
        }}
      >
        <table className="w-full">
          {/* Sticky header when scrolling */}
          <thead className={shouldScroll ? 'sticky top-0 z-10' : ''}>
            <tr 
              className="border-b"
              style={{ 
                backgroundColor: colors.primary[500],
                borderBottomColor: colors.secondary[200]
              }}
            >
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-4 py-3 text-sm font-medium ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ 
                    color: colors.white,
                    width: column.width 
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  {emptyIcon && (
                    <div className="h-8 w-8 mx-auto mb-2" style={{ color: colors.secondary[400] }}>
                      {emptyIcon}
                    </div>
                  )}
                  <p style={{ color: colors.secondary[500] }}>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr 
                  key={(row.id as string | number) || index}
                  className={`border-b transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  style={{ 
                    borderBottomColor: colors.secondary[200],
                    backgroundColor: index % 2 === 0 ? colors.white : colors.secondary[50]
                  }}
                  onClick={() => onRowClick && onRowClick(row)}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = colors.secondary[100];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? colors.white : colors.secondary[50];
                    }
                  }}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className={`px-4 py-3 text-sm ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                      style={{ color: colors.secondary[700] }}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : (row[column.key] as string) ?? '-'
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer with total count */}
      {data.length > 0 && (
        <div 
          className="px-6 py-3 border-t text-sm flex justify-between items-center"
          style={{ 
            backgroundColor: colors.secondary[50],
            borderTopColor: colors.secondary[200],
            color: colors.secondary[600]
          }}
        >
          <span>សរុប: {data.length} ធាតុ</span>
          
          {/* Scroll indicator */}
          {shouldScroll && (
            <span className="text-xs flex items-center">
              <span className="mr-1">↑↓</span>
              រំកិលដើម្បីមើលទាំងអស់
            </span>
          )}
        </div>
      )}
    </div>
  );
};