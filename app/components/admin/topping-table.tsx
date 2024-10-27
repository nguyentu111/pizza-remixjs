import { Topping } from "@prisma/client";
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

export function ToppingTable({
  toppings,
}: {
  toppings: ToppingWithMaterial[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredToppings = toppings.filter((topping) =>
    topping.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredToppings.length / itemsPerPage);
  const paginatedToppings = filteredToppings.slice(
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
            <Link to="/admin/toppings/add" className="mr-4">
              Thêm topping
            </Link>
          </Button>
          <Input
            type="text"
            placeholder="Tìm topping..."
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
    </div>
  );
}
