import { Textarea, TextareaProps } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useFormField } from "../form-field";

export const TextareaField = ({ className, ...props }: TextareaProps) => {
  const { formMessageId, name, defaultValue } = useFormField();
  return (
    <Textarea
      id={name}
      className={cn(className)}
      name={name}
      defaultValue={defaultValue}
      {...props}
    ></Textarea>
  );
};
