import { Input, InputProps } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { useFormField } from "../form-field";

export const InputField = ({ className, ...props }: InputProps) => {
  const { formMessageId, name, defaultValue } = useFormField();
  return (
    <Input
      id={name}
      className={cn(className)}
      name={name}
      defaultValue={defaultValue}
      {...props}
    />
  );
};
