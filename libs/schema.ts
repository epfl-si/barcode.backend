import SchemaBuilder from "@pothos/core";

const builder = new SchemaBuilder({});

builder.queryType({
	fields: (t) => ({
		hello: t.string({
			resolve: () => 'Hello World!',
		}),
	}),
});

// This generates your schema (with typedefs) automatically
export const schema = builder.toSchema();
