import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";

interface RevenueCardProps {
  total: number;
  monthly: number;
}

export function RevenueCard({ total, monthly }: RevenueCardProps) {
  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(total)}</div>
          <p className="text-muted-foreground">
            Tháng này: {formatCurrency(monthly)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
