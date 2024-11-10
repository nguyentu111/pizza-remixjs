import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "./button";
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

type QuickSelector = {
  label: string;
  startYear: Date;
  endYear: Date;
  variant?: ButtonVariant;
  onClick?: (selector: QuickSelector) => void;
};

const QUICK_SELECTORS: QuickSelector[] = [
  {
    label: "5 năm gần đây",
    startYear: new Date(new Date().getFullYear() - 4, 0),
    endYear: new Date(new Date().getFullYear(), 0),
  },
  {
    label: "10 năm gần đây",
    startYear: new Date(new Date().getFullYear() - 9, 0),
    endYear: new Date(new Date().getFullYear(), 0),
  },
];

type YearRangePickerProps = {
  selectedYearRange?: { start: Date; end: Date };
  onStartYearSelect?: (date: Date) => void;
  onYearRangeSelect?: ({ start, end }: { start: Date; end: Date }) => void;
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
  quickSelectors?: QuickSelector[];
  showQuickSelectors?: boolean;
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

// Helper function to get first and last day of year
const getFirstDayOfYear = (year: number) => new Date(year, 0, 1);
const getLastDayOfYear = (year: number) => new Date(year, 11, 31);

function YearRangePicker({
  selectedYearRange,
  onYearRangeSelect,
  onStartYearSelect,
  callbacks,
  variant,
  minDate,
  maxDate,
  quickSelectors = QUICK_SELECTORS,
  showQuickSelectors = true,
  onPageBackward,
  onPageForward,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & YearRangePickerProps) {
  const [baseYear, setBaseYear] = React.useState<number>(
    selectedYearRange?.start.getFullYear() ?? new Date().getFullYear(),
  );
  const [startYear, setStartYear] = React.useState<number>(
    selectedYearRange?.start.getFullYear() ?? new Date().getFullYear(),
  );
  const [endYear, setEndYear] = React.useState<number>(
    selectedYearRange?.end.getFullYear() ?? new Date().getFullYear(),
  );
  const [rangePending, setRangePending] = React.useState<boolean>(false);
  const [endLocked, setEndLocked] = React.useState<boolean>(true);

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
      <div className="flex gap-4">
        <div className="min-w-[280px]">
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
                  {yearRow.map((year) => {
                    const isInRange =
                      rangePending || endLocked
                        ? year > startYear && year < endYear
                        : false;
                    const isStart = year === startYear;
                    const isEnd = year === endYear;

                    return (
                      <td
                        key={year}
                        className={cn(
                          "h-10 w-1/4 text-center text-sm p-0 relative",
                          isInRange && "text-accent-foreground bg-accent",
                          isStart &&
                            "text-accent-foreground bg-accent rounded-l-md",
                          isEnd &&
                            "text-accent-foreground bg-accent rounded-r-md",
                        )}
                        onMouseEnter={() => {
                          if (rangePending && !endLocked) {
                            setEndYear(year);
                          }
                        }}
                      >
                        <button
                          onClick={() => {
                            if (rangePending) {
                              if (year < startYear) {
                                setRangePending(true);
                                setEndLocked(false);
                                setStartYear(year);
                                setEndYear(year);
                                if (onStartYearSelect) {
                                  onStartYearSelect(getFirstDayOfYear(year));
                                }
                              } else {
                                setRangePending(false);
                                setEndLocked(true);
                                if (onYearRangeSelect) {
                                  onYearRangeSelect({
                                    start: getFirstDayOfYear(startYear),
                                    end: getLastDayOfYear(year),
                                  });
                                }
                              }
                            } else {
                              setRangePending(true);
                              setEndLocked(false);
                              setStartYear(year);
                              setEndYear(year);
                              if (onStartYearSelect) {
                                onStartYearSelect(getFirstDayOfYear(year));
                              }
                            }
                          }}
                          disabled={
                            (minDate && year < minDate.getFullYear()) ||
                            (maxDate && year > maxDate.getFullYear())
                          }
                          className={cn(
                            buttonVariants({
                              variant:
                                isStart || isEnd
                                  ? variant?.calendar?.selected ?? "default"
                                  : variant?.calendar?.main ?? "ghost",
                            }),
                            "h-full w-full p-0 font-normal aria-selected:opacity-100",
                          )}
                        >
                          {callbacks?.yearLabel
                            ? callbacks.yearLabel(year)
                            : year}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showQuickSelectors && (
          <div className="flex flex-col gap-1 justify-center">
            {quickSelectors.map((selector) => (
              <Button
                key={selector.label}
                onClick={() => {
                  const startYear = selector.startYear.getFullYear();
                  const endYear = selector.endYear.getFullYear();
                  setStartYear(startYear);
                  setEndYear(endYear);
                  setRangePending(false);
                  setEndLocked(true);
                  if (onYearRangeSelect) {
                    onYearRangeSelect({
                      start: getFirstDayOfYear(startYear),
                      end: getLastDayOfYear(endYear),
                    });
                  }
                  if (selector.onClick) {
                    selector.onClick(selector);
                  }
                }}
                variant={selector.variant ?? "outline"}
              >
                {selector.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

YearRangePicker.displayName = "YearRangePicker";

export { YearRangePicker };
