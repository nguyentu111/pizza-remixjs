import { useLoaderData, useMatches } from "@remix-run/react";
import { MediaButton } from "~/components/shared/media-button";
import { useMatchesData } from "~/utils";

export default function AdminHome() {
  const data = useLoaderData();
  console.log(data);
  const matchdata = useMatchesData("routes/admin");
  console.log({ data, matchdata });
  return (
    <div>
      <MediaButton />
      <form action="/admin" method="post">
        <label>this form can show in any admin page</label>
        <input name="asd" value={"afsad fadf "} />
        <button type="submit" name="_action" value={"admin form"}>
          Submit
        </button>
      </form>
    </div>
  );
}
