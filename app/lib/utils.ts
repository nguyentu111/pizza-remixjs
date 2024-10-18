import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getSmallImageUrl(secureUrl: string, width = 200, height = 200) {
  const urlParts = secureUrl.split("/upload/");
  const transformation = `w_${width},h_${height},c_fit`; // Adjust transformation as needed
  return `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
}
