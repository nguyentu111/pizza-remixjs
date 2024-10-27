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
import { useToast } from "~/hooks/use-toast";

export function MaterialTable({ materials }: { materials: Material[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { fetcher: fetcherDelete } = useForm({
    onSuccess: () => {
      toast({ title: "Xóa thành công" });
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
            <Link to="/admin/materials/add" className="mr-4">
              Thêm nguyên liệu
            </Link>
          </Button>
          <Input
            type="text"
            placeholder="Tìm nguyên liệu..."
            className="max-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
                <img
                  src={getSmallImageUrl(material.image ?? "")}
                  alt={material.name}
                  className="w-10 h-10 object-cover"
                />
              </TableCell>
              <TableCell>{material.name}</TableCell>
              <TableCell>{material.unit}</TableCell>
              <TableCell>{material.warningLimits.toString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <fetcherDelete.Form
                    action={`/admin/materials/${material.id}`}
                    method="DELETE"
                  >
                    <Button variant={"ghost-destructive"}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild>
                    <Link to={`/admin/materials/${material.id}`}>
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
