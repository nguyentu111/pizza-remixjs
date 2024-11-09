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
import { ToppingWithMaterial } from "~/lib/type";
import { Pagination } from "../shared/pagination";

export function ToppingTable({
  toppings,
}: {
  toppings: ToppingWithMaterial[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredToppings = toppings.filter((topping) =>
    topping.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredToppings.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedToppings = filteredToppings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link to="/admin/toppings/add">Thêm topping</Link>
        </Button>
        <Input
          type="text"
          placeholder="Tìm topping..."
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
            <TableHead>Nguyên liệu</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedToppings.map((topping) => (
            <TableRow key={topping.id}>
              <TableCell>
                <img
                  src={getSmallImageUrl(topping.image ?? "")}
                  alt={topping.name}
                  className="w-10 h-10 object-cover"
                />
              </TableCell>
              <TableCell>{topping.name}</TableCell>
              <TableCell>{topping.price}</TableCell>
              <TableCell>{topping.Material?.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <fetcherDelete.Form
                    action={`/admin/toppings/${topping.id}`}
                    method="DELETE"
                  >
                    <Button variant={"ghost-destructive"}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild>
                    <Link to={`/admin/toppings/${topping.id}`}>
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
