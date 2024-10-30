import { SelectProps } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useFormField } from "../form-field";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps extends SelectProps {
  options: SelectOption[];
  placeholder?: string;
}

export const SelectField = ({
  options,
  placeholder,
  ...rest
}: SelectFieldProps) => {
  const { name, defaultValue } = useFormField();

  return (
    <Select name={name} defaultValue={defaultValue} {...rest}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
