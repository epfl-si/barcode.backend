import PrismaPlugin from '@pothos/plugin-prisma';
import SchemaBuilder from "@pothos/core";
import PrismaTypes, {getDatamodel} from "../generated/pothos-prisma-types";
import {prisma} from "./prisma";

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes; // This gives the builder all the type information about your prisma schema
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
    // This give pothos information about your tables, relations, and indexes to help it generate optimal queries at runtime.
    // This used to be attached to the prisma client, but has been removed in most runtimes/modes to reduce bundle size.
    dmmf: getDatamodel(),
    // warn when not using a query parameter correctly
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
  },
});

builder.prismaObject('Inventory', {
  name: 'GetInventory',
  fields: (t: any) => ({
    id: t.exposeID('id_storage'),
    barcode: t.exposeString('barcode'),
  }),
});

builder.queryType({
  fields: (t) => ({
    inventoryList: t.prismaField({
      type: 'Inventory',
      resolve: async (query, root, args, ctx, info) => {
        return prisma.inventory.findFirst();
      },
    }),
  }),
});

export const schema = builder.toSchema();
