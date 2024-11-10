import { Category } from "@prisma/client";
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
import { useStaffPermissions } from "~/hooks/use-staff-permissions";
import { PermissionsEnum } from "~/lib/type";

export function CategoryTable({ categories }: { categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const permissions = useStaffPermissions();
  const hasDeletePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.DeleteCategories,
  );
  const hasUpdatePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.UpdateCategories,
  );
  const hasCreatePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.CreateCategories,
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {hasCreatePermission && (
          <Button asChild>
            <Link to="/admin/categories/add">Thêm danh mục</Link>
          </Button>
        )}
        <Input
          type="text"
          placeholder="Tìm danh mục..."
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
            <TableHead>Slug</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCategories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <img
                  src={getSmallImageUrl(category.image)}
                  alt={category.name}
                  className="w-10 h-10 object-cover"
                />
              </TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {hasDeletePermission && (
                    <fetcherDelete.Form
                      action={`/admin/categories/${category.id}`}
                      method="DELETE"
                    >
                      <Button variant={"ghost-destructive"}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </fetcherDelete.Form>
                  )}
                  {hasUpdatePermission && (
                    <Button asChild>
                      <Link to={`/admin/categories/${category.id}`}>
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
