import { Border } from "@prisma/client";
import { Link } from "@remix-run/react";
import { EditIcon, TrashIcon } from "lucide-react";
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
import { getSmallImageUrl } from "~/lib/utils";
import { Pagination } from "../shared/pagination";
import { PermissionsEnum } from "~/lib/type";
import { useStaffPermissions } from "~/hooks/use-staff-permissions";

export function BorderTable({ borders }: { borders: Border[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredBorders = borders.filter((border) =>
    border.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredBorders.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedBorders = filteredBorders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const permissions = useStaffPermissions();
  const hasDeletePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.DeleteBorders,
  );
  const hasUpdatePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.UpdateBorders,
  );
  const hasCreatePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.CreateBorders,
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {hasCreatePermission && (
          <Button asChild>
            <Link to="/admin/borders/add">Thêm viền</Link>
          </Button>
        )}
        <Input
          type="text"
          placeholder="Tìm viền..."
          className="max-w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBorders.map((border) => (
            <TableRow key={border.id}>
              <TableCell>
                <img
                  src={getSmallImageUrl(border.image ?? "")}
                  alt={border.name}
                  className="w-10 h-10 object-cover"
                />
              </TableCell>
              <TableCell>{border.name}</TableCell>
              <TableCell>{border.price}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {hasDeletePermission && (
                    <fetcherDelete.Form
                      action={`/admin/borders/${border.id}`}
                      method="DELETE"
                    >
                      <Button variant={"ghost-destructive"}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </fetcherDelete.Form>
                  )}
                  {hasUpdatePermission && (
                    <Button asChild>
                      <Link to={`/admin/borders/${border.id}`}>
                        <EditIcon className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
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
