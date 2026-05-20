import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Portfolio CMS")
    .items([
      S.listItem()
        .title("Site Content")
        .schemaType("siteContent")
        .child(S.document().schemaType("siteContent").documentId("siteContent")),
    ]);
