import {builder} from "../builder";
import {z} from 'zod';

builder.prismaObject('Shelf', {
  name: 'Shelf',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
    createdBy: t.exposeString('createdBy'),
    createdOn: t.expose('createdOn', { type: 'DateTime' }),
    deletedBy: t.exposeString('deletedBy'),
    deletedOn: t.expose('deletedOn', { type: 'DateTime', nullable: true }),
    boxes: t.relation('boxes', {
      args: {
        includeDeleted: t.arg.boolean({ defaultValue: false }),
      },
      query: (args: { includeDeleted: boolean; }) => ({
        where: {
          deletedOn: args.includeDeleted ? undefined : null,
        }
      })
    })
  }),
});

builder.mutationType({
  fields: (t) => ({
    createShelf: t.string({
      authScopes: {
        needPermission: 'canCreateShelf'
      },
      args: {
        parentBarcode: t.arg.string(),
      },
      validate: z.object({
        parentBarcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        const shelf = await createShelf(ctx, args.parentBarcode!);
        return shelf.barcode;
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
  const parent = await context.prisma.storage.findUnique({where: {barcode: barcode}});
  const lastNumber = await context.prisma.shelf.aggregate({where: {idStorage: parent.id}, _max: {numShelf: true}});
  const newNumber = lastNumber._max.numShelf ? lastNumber._max.numShelf + 1 : 1;
  return await context.prisma.shelf.create({
    data: {
      idStorage: parent.id,
      barcode: `${barcode} E${newNumber}`,
      numShelf: newNumber,
      createdBy: context.user.username,
      createdOn: new Date()
    },
  });
  // TODO create boxes in cascade after saving shelves
}

async function deleteShelf (context: any, barcode: string) {
  const shelf = await context.prisma.shelf.update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: context.user.username,
      deletedOn: new Date()
    }
  });
  await context.prisma.box.updateMany({
    where: {
      idShelf: shelf.id
    },
    data: {
      deletedBy: context.user.username,
      deletedOn: new Date()
    }
  });
}
