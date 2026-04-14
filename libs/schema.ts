import {PrismaClient} from "@prisma/client";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";

const prisma = new PrismaClient();

const builder = new SchemaBuilder<{
	PrismaTypes: PrismaTypes;
}>({
	plugins: [PrismaPlugin],
	prisma: { client: prisma },
});

// Define the Item type from your Prisma model
builder.prismaObject("Item", {
	fields: (t) => ({
		id: t.exposeID("id"),
		name: t.exposeString("name"),
		createdAt: t.expose("createdAt", { type: "String" }),
	}),
});

builder.queryType({
	fields: (t) => ({
		hello: t.string({
			resolve: () => 'Hello World!',
		}),
		listItems: t.prismaField({
			type: ["Item"],
			resolve: async (query) => {
				return prisma.item.findMany({ ...query });
			},
		}),
	}),
});

// This generates your schema (with typedefs) automatically
export const schema = builder.toSchema();
