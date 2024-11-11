import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Control } from "react-hook-form";

interface InputFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
}

export const InputField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: InputFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
