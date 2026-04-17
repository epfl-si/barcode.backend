import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaTypes, {getDatamodel} from "../../generated/pothos-prisma-types";
import {prisma} from "./prisma";
import ValidationPlugin from '@pothos/plugin-validation';

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes; // This gives the builder all the type information about your prisma schema
}>({
  plugins: [PrismaPlugin, ValidationPlugin],
  prisma: {
    client: prisma,
    // This give pothos information about your tables, relations, and indexes to help it generate optimal queries at runtime.
    // This used to be attached to the prisma client, but has been removed in most runtimes/modes to reduce bundle size.
    dmmf: getDatamodel(),
    // warn when not using a query parameter correctly
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
  },
});
