import { useLoaderData, useMatches } from "@remix-run/react";
import { MediaButton } from "~/components/shared/media-button";
import { useMatchesData } from "~/hooks/use-matches-data";

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin pages</h1>
    </div>
  );
}
