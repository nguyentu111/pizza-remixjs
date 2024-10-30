import { Link } from "@remix-run/react";
import { useState } from "react";
import { useForm } from "~/hooks/use-form";
import { ProductWithCategory } from "~/lib/type";
import { getSmallImageUrl } from "~/lib/utils";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function ProductTable({
  products,
}: {
  products: ProductWithCategory[];
}) {
  const { setOpen } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
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
              className={`p-2 !min-w-[40px] ${currentPage === index + 1 ? "bg-blue-500 text-white rounded" : ""}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="flex">
          <Button asChild>
            <Link to="/admin/products/add" className="mr-4">
              Thêm sản phẩm
            </Link>
          </Button>
          <Input
            type="text"
            placeholder="Tìm sản phẩm..."
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
            <TableHead>Ảnh (Mobile)</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Mô tả ngắn</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Viền</TableHead>
            <TableHead>Topping</TableHead>
            <TableHead>Kích thước</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={getSmallImageUrl(product.image ?? "")}
                  alt={product.name}
                  className="w-10 h-10 object-cover"
                />
              </TableCell>
              <TableCell>
                <img
                  src={getSmallImageUrl(product.image_mobile ?? "")}
                  alt={`${product.name} (mobile)`}
                  className="w-10 h-10 object-cover"
                />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.shortDescription}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>
                {product.Borders.map((b) => b.border.name).join(", ")}
              </TableCell>
              <TableCell>
                {product.Toppings.map((t) => t.topping.name).join(", ")}
              </TableCell>
              <TableCell>
                {product.Sizes.map((s) => `${s.size.name}: ${s.price}`).join(
                  ", ",
                )}
              </TableCell>
              <TableCell>
                <Link to={`/admin/products/${product.id}`}>Sửa</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
