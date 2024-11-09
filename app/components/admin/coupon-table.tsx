import { Coupon } from "@prisma/client";
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

export function CouponTable({ coupons }: { coupons: Coupon[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredCoupons.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link to="/admin/coupons/add">Thêm mã giảm giá</Link>
        </Button>
        <Input
          type="text"
          placeholder="Tìm mã giảm giá..."
          className="max-w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Mã</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Ngày bắt đầu</TableHead>
            <TableHead>Ngày kết thúc</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCoupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>
                {coupon.image && (
                  <img
                    src={getSmallImageUrl(coupon.image)}
                    alt={coupon.name || "Coupon image"}
                    className="w-10 h-10 object-cover"
                  />
                )}
              </TableCell>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>{coupon.name}</TableCell>
              <TableCell>{coupon.discount.toString()}</TableCell>
              <TableCell>{coupon.quantity}</TableCell>
              <TableCell>
                {new Date(coupon.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(coupon.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <fetcherDelete.Form
                    action={`/admin/coupons/${coupon.id}`}
                    method="DELETE"
                  >
                    <Button variant={"ghost-destructive"}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild>
                    <Link to={`/admin/coupons/${coupon.id}`}>
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
