import { Material } from "@prisma/client";
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

export function MaterialTable({ materials }: { materials: Material[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredMaterials.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const permissions = useStaffPermissions();
  const hasDeletePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.DeleteMaterials,
  );
  const hasUpdatePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.UpdateMaterials,
  );
  const hasCreatePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.CreateMaterials,
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {hasCreatePermission && (
          <Button asChild>
            <Link to="/admin/materials/add">Thêm nguyên liệu</Link>
          </Button>
        )}
        <Input
          type="text"
          placeholder="Tìm nguyên liệu..."
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
            <TableHead>Đơn vị</TableHead>
            <TableHead>Giới hạn cảnh báo</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedMaterials.map((material) => (
            <TableRow key={material.id}>
              <TableCell>
                {material.image && (
                  <img
                    src={getSmallImageUrl(material.image)}
                    alt={material.name}
                    className="w-10 h-10 object-cover"
                  />
                )}
              </TableCell>
              <TableCell>{material.name}</TableCell>
              <TableCell>{material.unit}</TableCell>
              <TableCell>{material.warningLimits.toString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {hasDeletePermission && (
                    <fetcherDelete.Form
                      action={`/admin/materials/${material.id}`}
                      method="DELETE"
                    >
                      <Button variant={"ghost-destructive"}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </fetcherDelete.Form>
                  )}
                  {hasUpdatePermission && (
                    <Button asChild>
                      <Link to={`/admin/materials/${material.id}`}>
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
