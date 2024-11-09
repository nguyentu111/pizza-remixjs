import { Material } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
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
import { AlertCircle, Search, Trash2 } from "lucide-react";
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
import { useState } from "react";
import { Pagination } from "../shared/pagination";

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
  const [searchTerm, setSearchTerm] = useState("");
  const fetcher = useFetcher();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleDestroy = (materialId: string, expiredDate: string) => {
    fetcher.submit(
      { materialId, expiredDate },
      {
        method: "DELETE",
        action: "/admin/inventory",
        encType: "application/json",
      },
    );
  };

  const isExpired = (date: Date) => {
    return new Date(date) < new Date();
  };

  const getTotalQuantity = (material: InventoryMaterial) => {
    return material.Inventory.reduce(
      (sum, inv) => sum + Number(inv.quantity),
      0,
    );
  };

  const filteredInventory = inventory.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Input
            placeholder="Tìm kiếm nguyên liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-[300px]"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Tên nguyên liệu</TableHead>
            <TableHead className="w-[25%]">Tổng số lượng</TableHead>
            <TableHead className="w-[25%]">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedInventory.map((material) => {
            const hasExpiredItems = material.Inventory.some((inv) =>
              isExpired(inv.expiredDate),
            );
            const totalQuantity = getTotalQuantity(material);

            return (
              <TableRow key={material.id} className="group">
                <TableCell>
                  <Accordion type="single" collapsible>
                    <AccordionItem value={material.id} className="border-none">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <img
                            src={material.image || ""}
                            alt={material.name}
                            className="w-10 h-10 rounded-md"
                          />
                          <span className="font-medium">{material.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
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
                            {material.Inventory.map((inv) => {
                              const expired = isExpired(inv.expiredDate);

                              return (
                                <TableRow key={inv.expiredDate.toString()}>
                                  <TableCell className="flex items-center gap-1">
                                    <span>{Number(inv.quantity)}</span>
                                    <span className="text-muted-foreground text-sm">
                                      {material.unit}
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
                                              {material.unit} {material.name} đã
                                              hết hạn?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Hủy
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDestroy(
                                                  material.id,
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
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TableCell>
                <TableCell className="flex items-center gap-1">
                  <span>{totalQuantity}</span>
                  <span className="text-muted-foreground text-sm">
                    {material.unit}
                  </span>
                </TableCell>
                <TableCell>
                  {hasExpiredItems && (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Có hàng hết hạn
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}
