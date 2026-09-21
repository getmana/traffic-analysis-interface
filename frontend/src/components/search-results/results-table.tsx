"use client";

import { useRef } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { BackendSessionRow } from "@/types";

type ResultsTableProps = {
  rows: BackendSessionRow[];
  columns: ColumnDef<BackendSessionRow>[];
};

export function ResultsTable({ rows, columns }: ResultsTableProps) {
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  const tableRows = table.getRowModel().rows;

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="relative h-[70vh] overflow-auto rounded-md border">
      <Table style={{ display: "grid" }}>
        <TableHeader style={{ display: "grid", position: "sticky", top: 0, zIndex: 1 }} className="bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} style={{ display: "flex", width: "100%" }}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody style={{ display: "grid", height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = tableRows[virtualRow.index];
            return (
              <TableRow
                key={row.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  display: "flex",
                  position: "absolute",
                  transform: `translateY(${virtualRow.start}px)`,
                  width: "100%",
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
