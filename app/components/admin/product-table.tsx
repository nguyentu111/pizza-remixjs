import { Product } from "@prisma/client";
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

export function ProductTable({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link to="/admin/products/add">Thêm sản phẩm</Link>
        </Button>
        <Input
          type="text"
          placeholder="Tìm sản phẩm..."
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
            <TableHead>Mô tả ngắn</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.image && (
                  <img
                    src={getSmallImageUrl(product.image)}
                    alt={product.name}
                    className="w-10 h-10 object-cover"
                  />
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.shortDescription}</TableCell>
              <TableCell>{product.slug}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <fetcherDelete.Form
                    action={`/admin/products/${product.id}`}
                    method="DELETE"
                  >
                    <Button variant={"ghost-destructive"}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild>
                    <Link to={`/admin/products/${product.id}`}>
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
