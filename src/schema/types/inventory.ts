import {builder} from "../builder";
import {z} from 'zod';

builder.prismaObject('Inventory', {
  name: 'Inventory',
  fields: (t: any) => ({
    id: t.exposeID('id_storage'),
    barcode: t.exposeString('barcode'),
  }),
});

builder.queryType({
  fields: (t) => ({
    inventoryList: t.prismaField({
      type: ['Inventory'],
      authScopes: {
        isCosec: true,
      },
      resolve: async (query, root, args, ctx: any, info) => {
        return ctx.prisma.inventory.findMany();
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createInventory: t.boolean({
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
        await ctx.prisma.inventory.create({
          data: {
            barcode: args.barcode!,
          },
        });
        return true;
      },
    }),
    updateInventory: t.boolean({
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
        await ctx.prisma.inventory.update({
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
