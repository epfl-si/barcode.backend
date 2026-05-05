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
        needPermission: 'canCreateShelf'
      },
      args: {
        // TODO add storage barcode
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await createShelf(ctx, args.barcode!);
        return true;
      },
    }),
    deleteShelf: t.boolean({
      authScopes: {
        needPermission: 'canDeleteShelf'
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await deleteShelf(ctx, args.barcode!);
        return true;
      },
    }),
  }),
});

async function createShelf (context: any, barcode: string) {
  await context.prisma.shelf.create({
    data: {
      // TODO add id storage after get it from barcode
      barcode: barcode
    },
  });
  // TODO create boxes in cascade after saving shelves
}

async function deleteShelf (context: any, barcode: string) {
  // TODO delete boxes in cascade before deleting storages
  await context.prisma.shelf.delete({
    where: {
      barcode: barcode
    },
  });
}
