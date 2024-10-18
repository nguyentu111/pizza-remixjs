import { Media } from "@prisma/client";
import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { MediaButton } from "~/components/shared/media-button";
import { getSmallImageUrl } from "~/lib/utils";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  const [media, setMedia] = useState<Media | undefined>();
  return (
    <div>
      <MediaButton
        onSelected={(media) => setMedia(media)}
        selectedMedia={media}
      >
        Choose image
      </MediaButton>
      {media && <img src={getSmallImageUrl(media.url, 500, 500)} />}
    </div>
  );
}
