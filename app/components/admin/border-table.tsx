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

export function BorderTable({ borders }: { borders: Border[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredBorders = borders.filter((border) =>
    border.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBorders.length / itemsPerPage);
  const paginatedBorders = filteredBorders.slice(
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
            <Link to="/admin/borders/add" className="mr-4">
              Thêm viền
            </Link>
          </Button>
          <Input
            type="text"
            placeholder="Tìm viền..."
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
                  <fetcherDelete.Form
                    action={`/admin/borders/${border.id}`}
                    method="DELETE"
                  >
                    <Button variant={"ghost-destructive"}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild>
                    <Link to={`/admin/borders/${border.id}`}>
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
