import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { MediaButton } from "~/components/shared/media-button";
import { getSmallImageUrl } from "~/lib/utils";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  const [url, setUrl] = useState("");
  return (
    <div>
      <MediaButton onSelected={(media) => setUrl(media.url)}>
        Choose image
      </MediaButton>
      {url && <img src={getSmallImageUrl(url, 500, 500)} />}
    </div>
  );
}
