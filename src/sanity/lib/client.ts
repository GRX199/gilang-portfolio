import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

export const sanityClient = isSanityConfigured
  ? createClient({
      apiVersion,
      dataset,
      projectId,
      perspective: "published",
      useCdn: true,
    })
  : null;
