import { Size } from "@prisma/client";
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

export function SizeTable({ sizes }: { sizes: Size[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredSizes = sizes.filter((size) =>
    size.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredSizes.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedSizes = filteredSizes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link to="/admin/sizes/add">Thêm kích thước</Link>
        </Button>
        <Input
          type="text"
          placeholder="Tìm kích thước..."
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
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedSizes.map((size) => (
            <TableRow key={size.id}>
              <TableCell>
                {size.image && (
                  <img
                    src={getSmallImageUrl(size.image)}
                    alt={size.name}
                    className="w-10 h-10 object-cover"
                  />
                )}
              </TableCell>
              <TableCell>{size.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <fetcherDelete.Form
                    action={`/admin/sizes/${size.id}`}
                    method="DELETE"
                  >
                    <Button variant={"ghost-destructive"}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild>
                    <Link to={`/admin/sizes/${size.id}`}>
                      <EditIcon className="w-4 h-4" />
                    </Link>
                  </Button>
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
