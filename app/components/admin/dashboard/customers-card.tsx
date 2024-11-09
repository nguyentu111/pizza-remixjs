import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface CustomersCardProps {
  total: number;
  newThisMonth: number;
}

export function CustomersCard({ total, newThisMonth }: CustomersCardProps) {
  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-muted-foreground">Mới tháng này: {newThisMonth}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
