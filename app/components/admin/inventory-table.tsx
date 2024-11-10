import { Material } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { formatDate } from "~/lib/utils";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { useFetcher } from "@remix-run/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Pagination } from "../shared/pagination";
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ParsedActionResult } from "~/lib/type";
import { deleteInventorySchema } from "~/lib/schema";
import { useToast } from "~/hooks/use-toast";

type InventoryMaterial = Material & {
  Inventory: Array<{
    quantity: number | string;
    expiredDate: Date;
  }>;
  image?: string | null;
  unit: string;
};

export function InventoryTable({
  inventory,
}: {
  inventory: InventoryMaterial[];
}) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const { toast } = useToast();
  const fetcher =
    useFetcher<ParsedActionResult<typeof deleteInventorySchema>>();
  const isExpired = (date: Date) => {
    return new Date(date) < new Date();
  };

  const getTotalQuantity = (material: InventoryMaterial) => {
    return material.Inventory.reduce(
      (sum, inv) => sum + Number(inv.quantity),
      0,
    );
  };

  const handleDestroy = async (materialId: string, expiredDate: string) => {
    fetcher.submit(
      { materialId, expiredDate },
      {
        method: "DELETE",
        action: "/admin/inventory",
        encType: "application/json",
      },
    );
  };
  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data?.success) {
      toast({
        title: "Tiêu hủy nguyên liệu thành công",
      });
    } else {
      toast({
        title: "Uh oh. Có lỗi xảy ra.",
        description: fetcher.data?.error,
        variant: "destructive",
      });
    }
  }, [fetcher.data]);
  const columns: ColumnDef<InventoryMaterial>[] = [
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
      id: "image",
      header: "",
      cell: ({ row }) => (
        <img
          src={row.original.image || ""}
          alt={row.original.name}
          className="w-10 h-10 rounded-md"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Tên nguyên liệu",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      id: "totalQuantity",
      header: "Tổng số lượng",
      cell: ({ row }) => {
        const totalQuantity = getTotalQuantity(row.original);
        return (
          <div className="flex items-center gap-1">
            <span>{totalQuantity}</span>
            <span className="text-muted-foreground text-sm">
              {row.original.unit}
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const hasExpiredItems = row.original.Inventory.some((inv) =>
          isExpired(inv.expiredDate),
        );
        const expiredItemsBadge = hasExpiredItems ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Có hàng hết hạn
          </Badge>
        ) : null;
        const lowMaterialBadge =
          Number(row.original.warningLimits) >=
          row.original.Inventory.reduce(
            (sum, inv) => sum + Number(inv.quantity),
            0,
          ) ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Nguyên liệu ít hơn mức cảnh báo, hãy nhập thêm
            </Badge>
          ) : null;
        return (
          <div className="flex flex-col gap-2">
            {expiredItemsBadge}
            {lowMaterialBadge}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: inventory,
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
      <div className="flex items-center justify-between">
        <div className="relative">
          <Input
            placeholder="Tìm kiếm nguyên liệu..."
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
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
                      <div className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Số lượng</TableHead>
                              <TableHead>Ngày hết hạn</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead>Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {row.original.Inventory.map((inv) => {
                              const expired = isExpired(inv.expiredDate);
                              return (
                                <TableRow key={inv.expiredDate.toString()}>
                                  <TableCell className="flex items-center gap-1">
                                    <span>{Number(inv.quantity)}</span>
                                    <span className="text-muted-foreground text-sm">
                                      {row.original.unit}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(inv.expiredDate)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        expired ? "destructive" : "success"
                                      }
                                    >
                                      {expired ? "Hết hạn" : "Còn hạn"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {expired && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost-destructive"
                                            size="sm"
                                            className="flex items-center gap-2"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            Tiêu hủy
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Xác nhận tiêu hủy
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Bạn có chắc chắn muốn tiêu hủy{" "}
                                              {Number(inv.quantity)}{" "}
                                              {row.original.unit}{" "}
                                              {row.original.name} đã hết hạn?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Hủy
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDestroy(
                                                  row.original.id,
                                                  inv.expiredDate as unknown as string,
                                                )
                                              }
                                            >
                                              Tiêu hủy
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
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
          totalItems={inventory.length}
        />
      </div>
    </div>
  );
}
