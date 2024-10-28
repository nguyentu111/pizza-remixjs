import { Import, Status } from "@prisma/client";
import { Link } from "@remix-run/react";
import { EditIcon, EyeIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useForm } from "~/hooks/use-form";
import { Input } from "../ui/input";
import { formatDate, formatPrice } from "~/lib/utils";
import type { ImportWithDetails } from "~/models/import.server";
import { Badge } from "~/components/ui/badge";

type ImportTableProps = {
  imports: (Omit<ImportWithDetails, "totalAmount"> & {
    totalAmount: string | number;
  })[];
};

export function ImportTable({ imports }: ImportTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredImports = imports.filter(
    (import_) =>
      import_.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      import_.createdBy?.fullname
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      import_.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredImports.length / itemsPerPage);
  const paginatedImports = filteredImports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusVariant = (status: Status) => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "APPROVED":
        return "default";
      case "COMPLETED":
        return "success";
      case "REJECTED":
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6 justify-between">
        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`p-2 !min-w-[40px] ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white rounded"
                  : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="flex">
          <Button asChild>
            <Link to="/admin/imports/add" className="mr-4">
              Thêm phiếu nhập
            </Link>
          </Button>
          <Input
            type="text"
            placeholder="Tìm phiếu nhập..."
            className="max-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhà cung cấp</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Người tạo</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedImports.map((import_) => (
            <TableRow key={import_.id}>
              <TableCell>{import_.provider.name}</TableCell>
              <TableCell>{formatPrice(Number(import_.totalAmount))}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(import_.status)}>
                  {import_.status}
                </Badge>
              </TableCell>
              <TableCell>{import_.createdBy?.fullname}</TableCell>
              <TableCell>{formatDate(import_.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button asChild variant="ghost">
                    <Link to={`/admin/imports/${import_.id}/view`}>
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </Button>
                  <fetcherDelete.Form
                    action={`/admin/imports/${import_.id}`}
                    method="DELETE"
                  >
                    <Button variant="ghost-destructive">
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild variant="ghost">
                    <Link to={`/admin/imports/${import_.id}`}>
                      <EditIcon className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
