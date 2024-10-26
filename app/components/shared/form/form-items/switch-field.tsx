import { Switch } from "~/components/ui/switch";
import { useFormField } from "../form-field";
import { SwitchProps } from "@radix-ui/react-switch";
import { cn } from "~/lib/utils";

export const SwitchField = ({ className, ...props }: SwitchProps) => {
  const { name, defaultValue } = useFormField();
  return (
    <div className="h-9 flex items-center ">
      <Switch
        id={name}
        name={name}
        className={cn(className)}
        defaultChecked={defaultValue === "on"}
        {...props}
      />
    </div>
  );
};
