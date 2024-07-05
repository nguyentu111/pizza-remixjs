import { json } from "@remix-run/node";

export function loader() {
  return json({ asd: 14234 });
}
