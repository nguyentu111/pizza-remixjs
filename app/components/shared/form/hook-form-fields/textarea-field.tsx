import { Textarea } from "~/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Control } from "react-hook-form";

interface TextareaFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
}

export const TextareaField = ({
  control,
  name,
  label,
  placeholder,
}: TextareaFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
