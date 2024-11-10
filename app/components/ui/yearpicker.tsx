import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "./button";
import { cn } from "~/lib/utils";

const generateYearGrid = (baseYear: number): number[][] => {
  const years: number[][] = [];
  let currentYear = baseYear - 8;

  for (let i = 0; i < 3; i++) {
    const row: number[] = [];
    for (let j = 0; j < 4; j++) {
      row.push(currentYear);
      currentYear++;
    }
    years.push(row);
  }

  return years;
};

type YearPickerProps = {
  selectedYear?: Date;
  onYearSelect?: (date: Date) => void;
  onPageForward?: () => void;
  onPageBackward?: () => void;
  callbacks?: {
    yearLabel?: (year: number) => string;
  };
  variant?: {
    calendar?: {
      main?: ButtonVariant;
      selected?: ButtonVariant;
    };
    chevrons?: ButtonVariant;
  };
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
};

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "secondary"
  | null
  | undefined;

function YearPicker({
  selectedYear,
  onYearSelect,
  minDate,
  maxDate,
  disabledDates,
  callbacks,
  onPageBackward,
  onPageForward,
  variant,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & YearPickerProps) {
  const [baseYear, setBaseYear] = React.useState<number>(
    selectedYear?.getFullYear() ?? new Date().getFullYear(),
  );

  const years = generateYearGrid(baseYear);

  const handlePageChange = (direction: "forward" | "backward") => {
    const change = direction === "forward" ? 12 : -12;
    setBaseYear((prev) => prev + change);
    if (direction === "forward" && onPageForward) {
      onPageForward();
    } else if (direction === "backward" && onPageBackward) {
      onPageBackward();
    }
  };

  return (
    <div className={cn("min-w-[280px] p-3", className)} {...props}>
      <div className="flex justify-center pt-1 relative items-center">
        <div className="text-sm font-medium">
          {`${baseYear - 8} - ${baseYear + 3}`}
        </div>
        <div className="space-x-1 flex items-center">
          <button
            onClick={() => handlePageChange("backward")}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "inline-flex items-center justify-center h-7 w-7 p-0 absolute left-1",
            )}
          >
            <ChevronLeft className="opacity-50 h-4 w-4" />
          </button>
          <button
            onClick={() => handlePageChange("forward")}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "inline-flex items-center justify-center h-7 w-7 p-0 absolute right-1",
            )}
          >
            <ChevronRight className="opacity-50 h-4 w-4" />
          </button>
        </div>
      </div>

      <table className="w-full border-collapse space-y-1">
        <tbody>
          {years.map((yearRow, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="flex w-full mt-2">
              {yearRow.map((year) => (
                <td
                  key={year}
                  className="h-10 w-1/4 text-center text-sm p-0 relative"
                >
                  <button
                    onClick={() => {
                      if (onYearSelect) {
                        onYearSelect(new Date(year, 0));
                      }
                    }}
                    disabled={
                      (minDate && year < minDate.getFullYear()) ||
                      (maxDate && year > maxDate.getFullYear()) ||
                      disabledDates?.some((date) => date.getFullYear() === year)
                    }
                    className={cn(
                      buttonVariants({
                        variant:
                          selectedYear?.getFullYear() === year
                            ? variant?.calendar?.selected ?? "default"
                            : variant?.calendar?.main ?? "ghost",
                      }),
                      "h-full w-full p-0 font-normal aria-selected:opacity-100",
                    )}
                  >
                    {callbacks?.yearLabel ? callbacks.yearLabel(year) : year}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

YearPicker.displayName = "YearPicker";

export { YearPicker };
