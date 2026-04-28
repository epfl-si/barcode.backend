import {builder} from "../builder";
import {z} from 'zod';

builder.prismaObject('Storage', {
  name: 'Storage',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
  }),
});

builder.queryType({
  fields: (t) => ({
    storages: t.prismaField({
      type: ['Storage'],
      authScopes: {
        needPermission: 'canReadStorage'
      },
      resolve: async (query, root, args, ctx: any, info) => {
        return ctx.prisma.storage.findMany();
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createStorage: t.boolean({
      authScopes: {
        needPermission: 'canCreateStorage'
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await ctx.prisma.storage.create({
          data: {
            barcode: args.barcode!,
          },
        });
        return true;
      },
    }),
  }),
});
