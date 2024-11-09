import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useNavigate } from "@remix-run/react";

interface RevenueData {
  date: string;
  currentRevenue: number;
  previousRevenue: number;
}

interface RevenueComparisonChartProps {
  data: RevenueData[];
  startDate?: Date;
  endDate?: Date;
  period: "day" | "month" | "year";
}

export function RevenueComparisonChart({
  data,
  startDate,
  endDate,
  period,
}: RevenueComparisonChartProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startDate || addDays(new Date(), -30),
    to: endDate || new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "month" | "year"
  >(period);
  const navigate = useNavigate();

  const handleFilter = () => {
    const searchParams = new URLSearchParams();
    if (dateRange.from) searchParams.set("from", dateRange.from.toISOString());
    if (dateRange.to) searchParams.set("to", dateRange.to.toISOString());
    searchParams.set("period", selectedPeriod);

    navigate(`/admin?${searchParams.toString()}`);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value;
  };

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
    >
      <Card>
        <CardHeader>
          <CardTitle>So sánh doanh thu</CardTitle>
          <div className="flex gap-4 mt-4">
            <Select
              value={selectedPeriod}
              onValueChange={(value) =>
                setSelectedPeriod(value as "day" | "month" | "year")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Theo ngày</SelectItem>
                <SelectItem value="month">Theo tháng</SelectItem>
                <SelectItem value="year">Theo năm</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            <Button onClick={handleFilter}>Lọc</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 60,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis tickFormatter={formatYAxis} width={80} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Ngày: ${label}`}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="currentRevenue"
                  stroke="#8884d8"
                  name="Doanh thu hiện tại"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="previousRevenue"
                  stroke="#82ca9d"
                  name="Doanh thu kỳ trước"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
