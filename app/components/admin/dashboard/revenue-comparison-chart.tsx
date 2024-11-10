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
import { cn, formatCurrency } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useNavigate } from "@remix-run/react";
import { MonthRangePicker } from "~/components/ui/monthrangepicker";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { YearRangePicker } from "~/components/ui/yearrangepicker";

interface RevenueData {
  date: string;
  revenue: number;
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
    return value.toString();
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
            {selectedPeriod === "day" && (
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(value) =>
                  setDateRange({ from: value?.from, to: value?.to })
                }
              />
            )}
            {selectedPeriod === "month" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange.from &&
                        !dateRange.to &&
                        "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to ? (
                      `${format(dateRange.from, "MM/yyyy")} - ${format(
                        dateRange.to,
                        "MM/yyyy",
                      )}`
                    ) : (
                      <span>Chọn khoảng tháng</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <MonthRangePicker
                    onMonthRangeSelect={(newDates) =>
                      setDateRange({ from: newDates.start, to: newDates.end })
                    }
                    selectedMonthRange={{
                      start: dateRange.from || new Date(),
                      end: dateRange.to || new Date(),
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
            {selectedPeriod === "year" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange.from &&
                        !dateRange.to &&
                        "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to ? (
                      `${format(dateRange.from, "yyyy")} - ${format(
                        dateRange.to,
                        "yyyy",
                      )}`
                    ) : (
                      <span>Chọn khoảng năm</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <YearRangePicker
                    onYearRangeSelect={(newDates) =>
                      setDateRange({ from: newDates.start, to: newDates.end })
                    }
                    selectedYearRange={{
                      start: dateRange.from || new Date(),
                      end: dateRange.to || new Date(),
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
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
                  labelFormatter={(label) =>
                    `${selectedPeriod === "day" ? "Ngày" : selectedPeriod === "month" ? "Tháng" : "Năm"}: ${label}`
                  }
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Doanh thu"
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
