import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProviderStats {
  providerName: string;
  totalImports: number;
  totalMaterials: number;
  qualityRate: number;
  materialStats: Array<{
    materialName: string;
    quantity: number;
    unit: string;
  }>;
}

interface InventoryStatsProps {
  providers: ProviderStats[];
  totalImports: number;
  totalMaterials: number;
  averageQualityRate: number;
}

export function InventoryStatsCard({
  providers = [],
  totalImports = 0,
  totalMaterials = 0,
  averageQualityRate = 0,
}: InventoryStatsProps) {
  const qualityData = providers.map((provider) => ({
    name: provider.providerName,
    "Tỷ lệ đạt chuẩn": provider.qualityRate.toFixed(2),
    "Trung bình ngành": averageQualityRate.toFixed(2),
  }));

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      className="col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>Thống kê nhập kho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng đơn nhập</p>
              <p className="text-2xl font-bold">{totalImports}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng nguyên liệu</p>
              <p className="text-2xl font-bold">{totalMaterials}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tỷ lệ đạt chuẩn TB
              </p>
              <p className="text-2xl font-bold">
                {averageQualityRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4">
              Tỷ lệ chất lượng theo nhà cung cấp
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Tỷ lệ đạt chuẩn"
                    fill="#8884d8"
                    name="Tỷ lệ đạt chuẩn (%)"
                  />
                  <Bar
                    dataKey="Trung bình ngành"
                    fill="#82ca9d"
                    name="Trung bình ngành (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Chi tiết theo nhà cung cấp</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Số đơn nhập</TableHead>
                  <TableHead>Nguyên liệu chính</TableHead>
                  <TableHead>Tỷ lệ đạt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.providerName}>
                    <TableCell className="font-medium">
                      {provider.providerName}
                    </TableCell>
                    <TableCell>{provider.totalImports}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {provider.materialStats.slice(0, 3).map((stat) => (
                          <div key={stat.materialName} className="text-sm">
                            {stat.materialName}: {stat.quantity} {stat.unit}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          provider.qualityRate >= averageQualityRate
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {provider.qualityRate.toFixed(1)}%
                      </span>
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
