import { useLoaderData, useMatches } from "@remix-run/react";
import { MediaButton } from "~/components/shared/media-button";
import { useMatchesData } from "~/lib/utils";

export default function AdminHome() {
  const data = useLoaderData();
  const matchdata = useMatchesData("routes/admin");
  return (
    <div>
      <MediaButton mediaType="product" className="" variant={"link"}>
        {"Choose image"}
      </MediaButton>
    </div>
  );
}
