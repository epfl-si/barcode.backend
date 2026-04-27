import {builder} from "../builder";
import {z} from 'zod';

builder.prismaObject('Storage', {
  name: 'Storage',
  fields: (t: any) => ({
    idStorage: t.exposeID('idStorage'),
    barcode: t.exposeString('barcode'),
  }),
});

builder.queryType({
  fields: (t) => ({
    locations: t.prismaField({
      type: ['Storage'],
      authScopes: {
        isCosec: true,
      },
      resolve: async (query, root, args, ctx: any, info) => {
        return ctx.prisma.location.findMany();
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createStorage: t.boolean({
      authScopes: {
        isCosec: true,
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await ctx.prisma.location.create({
          data: {
            barcode: args.barcode!,
          },
        });
        return true;
      },
    }),
    updateStorage: t.boolean({
      authScopes: {
        isCosec: true,
      },
      args: {
        id: t.arg.int(),
        barcode: t.arg.string(),
      },
      validate: z.object({
        id: z.int(),
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await ctx.prisma.location.update({
          where: { id_storage: args.id },
          data: {
            barcode: args.barcode!,
          },
        });
        return true;
      },
    }),
  }),
});
