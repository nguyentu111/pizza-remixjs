import { json } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const address = url.searchParams.get("q");

  if (!address) {
    return json({ hits: [] });
  }

  try {
    const response = await fetch(
      `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(address)}&locale=vi&limit=5&key=${process.env.GRAPHHOPPER_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address");
    }

    const data = await response.json();

    return json(data);
  } catch (error) {
    console.error("Address search error:", error);
    return json({ hits: [] });
  }
};
