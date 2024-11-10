import { Form, useNavigation } from "@remix-run/react";
import {
  CellContext,
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { useStaffRoles } from "~/hooks/use-staff-roles";
import { OrderWithDetailsCustomerCoupon } from "~/lib/type";
import { formatDate, formatPrice } from "~/lib/utils";
import { Pagination } from "../shared/pagination";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function ShipmentOrderTable({
  orders,
}: {
  orders: OrderWithDetailsCustomerCoupon[];
}) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { roles } = useStaffRoles();
  const isShipper = roles?.some((r) => r.name === "Shipper");

  const columns: ColumnDef<OrderWithDetailsCustomerCoupon>[] = [
    ...(isShipper
      ? [
          {
            id: "select",
            header: ({
              table,
            }: {
              table: TableType<OrderWithDetailsCustomerCoupon>;
            }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => {
                  table.toggleAllPageRowsSelected(!!value);
                  const pageRows = table.getRowModel().rows;
                  if (value) {
                    setSelectedOrders((prev) => [
                      ...prev,
                      ...pageRows.map(
                        (row: Row<OrderWithDetailsCustomerCoupon>) =>
                          row.original.id,
                      ),
                    ]);
                  } else {
                    setSelectedOrders((prev) =>
                      prev.filter(
                        (id) =>
                          !pageRows.find(
                            (row: Row<OrderWithDetailsCustomerCoupon>) =>
                              row.original.id === id,
                          ),
                      ),
                    );
                  }
                }}
              />
            ),
            cell: ({
              row,
            }: CellContext<OrderWithDetailsCustomerCoupon, unknown>) => (
              <Checkbox
                checked={selectedOrders.includes(row.original.id)}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedOrders((prev) => [...prev, row.original.id]);
                  } else {
                    setSelectedOrders((prev) =>
                      prev.filter((id) => id !== row.original.id),
                    );
                  }
                }}
              />
            ),
          },
        ]
      : []),
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 hover:bg-transparent w-10"
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      accessorKey: "id",
      header: "Mã đơn",
      cell: ({ row }) => (
        <span className="font-medium">#{row.original.id.slice(0, 8)}</span>
      ),
    },
    {
      header: "Khách hàng",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customer.fullname}</p>
          <p className="text-sm text-gray-500">
            {row.original.customer.phoneNumbers}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng tiền",
      cell: ({ row }) => formatPrice(Number(row.original.totalAmount)),
    },
    {
      accessorKey: "paymentStatus",
      header: "Thanh toán",
      cell: ({ row }) => (
        <>
          {row.original.paymentStatus === "PAID" ? (
            <Badge variant="success">Đã thanh toán</Badge>
          ) : (
            <Badge variant="destructive">Chưa thanh toán</Badge>
          )}
        </>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="space-y-4">
      {isShipper && selectedOrders.length > 0 && (
        <div className="sticky top-0 bg-white p-4 shadow rounded-lg z-10">
          <div className="flex justify-between items-center">
            <span>Đã chọn {selectedOrders.length} đơn hàng</span>
            <Form method="POST" action="/admin/ship/delivery/create">
              {selectedOrders.map((orderId) => (
                <input
                  type="hidden"
                  name="orderIds[]"
                  value={orderId}
                  key={orderId}
                />
              ))}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo chuyến giao hàng"}
              </Button>
            </Form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="relative">
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            onChange={(e) =>
              table.getColumn("id")?.setFilterValue(e.target.value)
            }
            className="pl-10 max-w-[300px]"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <>
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="space-y-4 p-4">
                        {row.original.OrderDetail.map((detail, index) => (
                          <div key={detail.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="grid gap-2">
                              <div className="flex items-center gap-4">
                                <img
                                  src={detail.product.image || ""}
                                  alt={detail.product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                  <h4 className="font-medium">
                                    {detail.product.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    x{detail.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="grid gap-1 text-sm">
                                {detail.product.Sizes.length > 1 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Kích thước:
                                    </span>
                                    <span>{detail.size.name}</span>
                                  </div>
                                )}
                                {detail.border && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Viền:</span>
                                    <span>{detail.border.name}</span>
                                  </div>
                                )}
                                {detail.topping && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Topping:
                                    </span>
                                    <span>{detail.topping.name}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium">
                                  <span>Thành tiền:</span>
                                  <span>
                                    {formatPrice(Number(detail.totalAmount))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={table.setPageSize}
          totalItems={orders.length}
        />
      </div>
    </div>
  );
}
