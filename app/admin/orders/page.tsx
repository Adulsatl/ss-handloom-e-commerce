"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useCourierShippingLabels } from "@/components/courier-shipping-labels"

interface Order {
  id: string
  customerName: string
  orderDate: string
  totalAmount: number
  status: string
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handlePrintLabel(order)}>
            Print Label
          </Button>
          <Button variant="outline" onClick={() => handleCreateShipment(order)}>
            Create Shipment
          </Button>
        </div>
      )
    },
  },
]

const data: Order[] = [
  {
    id: "123",
    customerName: "John Doe",
    orderDate: "2023-01-01",
    totalAmount: 100,
    status: "Shipped",
  },
  {
    id: "456",
    customerName: "Jane Smith",
    orderDate: "2023-01-02",
    totalAmount: 200,
    status: "Pending",
  },
]

export default function OrdersPage() {
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [orders, setOrders] = useState(data)
  const [state, setState] = useState({ shipments: [] as any[] })

  const { generateCourierLabel } = useCourierShippingLabels()

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPageIndexChange: setPageIndex,
    onPageSizeChange: setPageSize,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  })

  const handlePrintLabel = (order: any) => {
    const shipment = state.shipments.find((s) => s.order_id === order.id)
    if (shipment) {
      generateCourierLabel(shipment.carrier, order.id, shipment.tracking_number)
    } else {
      toast({
        title: "No Shipment Found",
        description: "Please create a shipment first before printing the label.",
        variant: "destructive",
      })
    }
  }

  const handleCreateShipment = (order: any) => {
    setState((prevState) => ({
      ...prevState,
      shipments: [...prevState.shipments, { order_id: order.id, carrier: "ups", tracking_number: "1234567890" }],
    }))
    toast({
      title: "Shipment Created",
      description: "Shipment created successfully.",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter orders..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
