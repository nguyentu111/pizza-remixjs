import { ShouldRevalidateFunction } from "@remix-run/react";
import { getMedias } from "~/models/media.server";
export const loader = async () => {
  return await getMedias();
};

export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  currentParams,
  currentUrl,
  defaultShouldRevalidate,
  formAction,
  formData,
  formEncType,
  formMethod,
  nextParams,
  nextUrl,
}) => {
  console.log({
    actionResult,
    currentParams,
    currentUrl,
    defaultShouldRevalidate,
    formAction,
    formData,
    formEncType,
    formMethod,
    nextParams,
    nextUrl,
  });
  return defaultShouldRevalidate;
};
