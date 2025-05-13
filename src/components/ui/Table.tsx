import React from "react";
import { twMerge } from "tailwind-merge";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  compact?: boolean;
  hoverable?: boolean;
  selectedRowId?: string | number;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  isLoading = false,
  emptyMessage = "No data available",
  className,
  striped = false,
  compact = false,
  hoverable = true,
  selectedRowId,
}: TableProps<T>) {
  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }
    return item[column.accessor];
  };

  const sizeClasses = {
    th: compact ? "px-4 py-2" : "px-6 py-3",
    td: compact ? "px-4 py-2" : "px-6 py-4",
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-primary-100 rounded" />
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-16 bg-primary-50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-primary-200">
      <table
        className={twMerge("min-w-full divide-y divide-primary-200", className)}
      >
        <thead className="bg-primary-50">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                scope="col"
                className={twMerge(
                  sizeClasses.th,
                  "text-xs font-semibold text-primary-700 uppercase tracking-wider",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.width && `w-[${column.width}]`,
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-primary-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={twMerge(
                  sizeClasses.td,
                  "text-center text-sm text-primary-500"
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => {
              const isSelected =
                selectedRowId !== undefined && item.id === selectedRowId;
              return (
                <tr
                  key={item.id || rowIdx}
                  onClick={() => onRowClick?.(item)}
                  className={twMerge(
                    striped && rowIdx % 2 === 1 && "bg-primary-50/30",
                    hoverable && "transition-colors duration-150",
                    hoverable &&
                      onRowClick &&
                      "cursor-pointer hover:bg-primary-50",
                    isSelected && "bg-primary-100",
                    isSelected && hoverable && "hover:bg-primary-100/80"
                  )}
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={twMerge(
                        sizeClasses.td,
                        "whitespace-nowrap text-sm text-primary-900",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                        column.className
                      )}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
