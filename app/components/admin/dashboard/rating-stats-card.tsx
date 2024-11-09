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
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RatingStats {
  averageRating: number;
  responseRate: number;
  totalOrders: number;
  totalRatings: number;
  ratingDistribution: {
    stars: number;
    count: number;
  }[];
  recentRatings: Array<{
    orderId: string;
    customerName: string;
    stars: number;
    description: string | null;
    createdAt: Date;
  }>;
}

const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#8884d8"];

export function RatingStatsCard({ stats }: { stats: RatingStats }) {
  const pieData = stats.ratingDistribution.map((item) => ({
    name: `${item.stars} sao`,
    value: item.count,
  }));

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      className="col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>Thống kê đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
                <p className="text-2xl font-bold">
                  {stats.totalRatings > 0
                    ? stats.averageRating.toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tỷ lệ phản hồi</p>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <p className="text-2xl font-bold">
                  {(stats.responseRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
              <p className="text-2xl font-bold">{stats.totalRatings}</p>
              <p className="text-sm text-muted-foreground">
                trên {stats.totalOrders} đơn hàng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.totalRatings > 0 ? (
              <>
                <div>
                  <h3 className="font-semibold mb-4">Phân bố đánh giá</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Đánh giá gần đây</h3>
                  <div className="space-y-4 max-h-[200px] overflow-y-auto">
                    {stats.recentRatings.map((rating) => (
                      <div
                        key={rating.orderId}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {rating.customerName}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                            <span>{rating.stars}</span>
                          </div>
                        </div>
                        {rating.description && (
                          <p className="text-sm text-gray-600">
                            {rating.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(rating.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                Chưa có đánh giá nào
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
