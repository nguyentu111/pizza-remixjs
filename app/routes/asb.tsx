// MapComponent.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { Map } from "~/components/shipper/map.client";
// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const url = new URL(request.url);
//   const start = url.searchParams.get("start")?.split(",").map(Number);
//   const end = url.searchParams.get("end")?.split(",").map(Number);
//   console.log({ start, end });
//   let data = JSON.stringify({
//     points: [start, end],
//     snap_preventions: ["motorway", "ferry", "tunnel"],
//     details: ["road_class", "surface"],
//     profile: "car",
//     locale: "vi",
//     instructions: true,
//     calc_points: true,
//     points_encoded: false,
//   });

//   let config = {
//     method: "post",
//     maxBodyLength: Infinity,
//     url: "https://graphhopper.com/api/1/route?key=98affaf4-7d5a-4df6-a134-b6d988de2b7a",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     data: data,
//   };
//   const rs = await axios.request(config);
//   return json(rs.data);
// };

export default function TestPage() {
  const [start, end] = [
    [10.8298295, 106.7617899] as [number, number],
    [11.0644508, 107.1684479] as [number, number],
  ];
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div>
      <h1>Map with Route</h1>
      {isClient && <Map start={start} end={end} />}
    </div>
  );
}
