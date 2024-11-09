import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface CouponStatsProps {
  totalCoupons: number;
  usedCoupons: number;
  totalDiscount: number;
  topCoupons: Array<{
    code: string;
    usageCount: number;
    totalDiscount: number;
    name: string;
  }>;
}

export function CouponStatsCard({
  totalCoupons,
  usedCoupons,
  totalDiscount,
  topCoupons,
}: CouponStatsProps) {
  const usageRate = ((usedCoupons / totalCoupons) * 100).toFixed(1);

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      className="col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>Thống kê mã giảm giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng số mã</p>
              <p className="text-2xl font-bold">{totalCoupons}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tỷ lệ sử dụng</p>
              <p className="text-2xl font-bold">{usageRate}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng giảm giá</p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(totalDiscount)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Mã giảm giá phổ biến</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số lần dùng</TableHead>
                  <TableHead>Tổng giảm giá</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCoupons.map((coupon) => (
                  <TableRow key={coupon.code}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>{coupon.usageCount}</TableCell>
                    <TableCell className="text-red-500">
                      {formatCurrency(coupon.totalDiscount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
