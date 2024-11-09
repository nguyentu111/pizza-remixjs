import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InventoryAlertsCardProps {
  materials: Array<{
    id: string;
    name: string;
    unit: string;
    Inventory: Array<{
      quantity: number;
    }>;
  }>;
}

export function InventoryAlertsCard({ materials }: InventoryAlertsCardProps) {
  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials.map((material) => (
              <Alert variant="destructive" key={material.id}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nguyên liệu sắp hết</AlertTitle>
                <AlertDescription>
                  {material.name} còn {material.Inventory[0]?.quantity}{" "}
                  {material.unit}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
