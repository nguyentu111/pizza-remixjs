import { Link } from "@remix-run/react";
import { useUser } from "~/utils";

export default function NoteIndexPage() {
  const user = useUser();
  return (
    <p>
      hello {user.email}
      No note selected. Select a note on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new note.
      </Link>
    </p>
  );
}
