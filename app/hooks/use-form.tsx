import { useActionData, useFetcher } from "@remix-run/react";
import { z, ZodSchema } from "zod";
import { ActionResultType, RawActionResult } from "~/actions/type";
import { Input, InputProps } from "~/components/ui/input";
import { cn } from "~/lib/utils";

// export function useForm<T extends ZodSchema> (schema : T) {

//   const fetcher = useFetcher<T>();
//   const data = useActionData<RawActionResult<z.infer<typeof schema>>>()
//   const createInput = (
//     { className, name, ...props }: InputProps,
//   ) => {
//     return (
//       <div>
//         <Input name={name} {...props} className={cn(className)} />
//         {data?.}
//       </div>
//     );
//   };
//   return {
//     ...fetcher,
//     Input
//   }
// };
