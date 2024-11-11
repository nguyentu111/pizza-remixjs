import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Control } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  options: Option[];
}

export const MultiSelectField = ({
  control,
  name,
  label,
  placeholder = "Chọn...",
  options,
}: MultiSelectFieldProps) => {
  console.log({ options });
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const values = field.value || [];
        console.log({ values });
        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !values.length && "text-muted-foreground",
                    )}
                  >
                    {values.length > 0
                      ? `${values.length} đã chọn`
                      : placeholder}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={`Tìm ${label?.toLowerCase()}...`}
                  />
                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            const newValues = values.includes(option.value)
                              ? values.filter(
                                  (value: string) => value !== option.value,
                                )
                              : [...values, option.value];
                            field.onChange(newValues);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              values.includes(option.value)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
