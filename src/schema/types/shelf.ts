import {builder} from "../builder";
import {z} from 'zod';

builder.prismaObject('Shelf', {
  name: 'Shelf',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
    boxes: t.relation('boxes')
  }),
});

builder.mutationType({
  fields: (t) => ({
    createShelf: t.boolean({
      authScopes: {
        needPermission: 'canCreateStorage'
      },
      args: {
        // TODO add storage barcode
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await ctx.prisma.shelf.create({
          data: {
            // TODO add id storage after get it from barcode
            barcode: args.barcode!,
          },
        });
        // TODO create boxes in cascade after saving shelves
        return true;
      },
    }),
    deleteShelf: t.boolean({
      authScopes: {
        needPermission: 'canDeleteStorage'
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        // TODO delete boxes in cascade before deleting storages
        await ctx.prisma.shelf.delete({
          where: {
            barcode: args.barcode!,
          },
        });
        return true;
      },
    }),
  }),
});
