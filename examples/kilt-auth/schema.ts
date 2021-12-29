import { list } from "@keystone-6/core";
import { checkbox, text, timestamp } from "@keystone-6/core/fields";

export const lists = {
  User: list({
    fields: {
      DID: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      isAdmin: checkbox(),
      createdAt: timestamp({ db: { updatedAt: true } }),
    },
  }),
};
