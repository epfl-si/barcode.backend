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
      authScopes: {
        needPermission: 'canReadBox'
      },
      query: (args:{}, ctx: any) => ({
        where: {
          deletedOn: ctx.user.isAdmin ? undefined : null,
        },
        orderBy: {
          numBox: 'asc'
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
        const parent = await ctx.prisma.storage.findUnique({where: {barcode: args.parentBarcode!}});
        if (parent.deletedBy !== null) {
          throw new Error("You cannot add a shelf on a deleted storage")
        }
        const allowedType = await ctx.prisma.allowedTypeValue.findFirst(
          {where: {
            idRoomType: parent.idRoomType,
            idProductType: parent.idProductType,
            idStorageType: parent.idStorageType,
            idStorageSubType: parent.idStorageSubType
          }});
        if (!allowedType.allowsShelves) {
          throw new Error("You cannot add a shelf on this type of storage")
        }
        const shelf = await createShelf(ctx, args.parentBarcode!, parent);
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
    restoreShelf: t.boolean({
      authScopes: {
        needPermission: 'isAdmin'
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        const parent = await ctx.prisma.shelf.findUnique({
          where: {barcode: args.barcode!},
          include: {storage: true}
        });
        if (parent.storage.deletedBy !== null) {
          throw new Error("You cannot add a shelf on a deleted storage")
        }
        await restoreShelf(ctx, args.barcode!);
        return true;
      },
    }),
  }),
});

async function createShelf (context: any, barcode: string, parent: {id: number}) {
  const lastNumber = await context.prisma.shelf.aggregate({where: {idStorage: parent.id}, _max: {numShelf: true}});
  const newNumber = lastNumber._max.numShelf ? lastNumber._max.numShelf + 1 : 1;
  return await context.prisma.shelf.create({
    data: {
      idStorage: parent.id,
      barcode: `${barcode} E${newNumber}`,
      numShelf: newNumber,
      createdBy: `${context.user.familyName} ${context.user.givenName} (${context.user.sciper})`,
      createdOn: new Date()
    },
  });
}

async function deleteShelf (context: any, barcode: string) {
  const shelf = await context.prisma.shelf.update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: `${context.user.familyName} ${context.user.givenName} (${context.user.sciper})`,
      deletedOn: new Date()
    }
  });
  await context.prisma.box.updateMany({
    where: {
      idShelf: shelf.id
    },
    data: {
      deletedBy: `${context.user.familyName} ${context.user.givenName} (${context.user.sciper})`,
      deletedOn: new Date()
    }
  });
}

async function restoreShelf (context: any, barcode: string) {
  await context.prisma.shelf.update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: null,
      deletedOn: null
    }
  });
}
