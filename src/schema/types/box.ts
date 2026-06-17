import {builder} from "../builder";
import {z} from 'zod';
import {callRmmAndGetStatusForDeletion} from "../../lib/rmmStatusAnalyser";
import {getUserString} from "../../lib/user";
import {restoreLocation} from "./location";

builder.prismaObject('Box', {
  name: 'Box',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
    createdBy: t.exposeString('createdBy'),
    createdOn: t.expose('createdOn', { type: 'DateTime' }),
    deletedBy: t.exposeString('deletedBy'),
    deletedOn: t.expose('deletedOn', { type: 'DateTime', nullable: true }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createBox: t.string({
      authScopes: {
        needPermission: 'canCreateBox'
      },
      args: {
        parentBarcode: t.arg.string(),
      },
      validate: z.object({
        parentBarcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        const parent = await ctx.prisma.shelf.findUnique({
          where: {barcode: args.parentBarcode!},
          include: {storage: true}
        });
        if (parent.deletedBy !== null || parent.storage.deletedBy !== null) {
          throw new Error("You cannot add a box on a deleted storage or shelf")
        }
        const allowedType = await ctx.prisma.allowedTypeValue.findFirst(
          {where: {
            idRoomType: parent.storage.idRoomType,
            idProductType: parent.storage.idProductType,
            idStorageType: parent.storage.idStorageType,
            idStorageSubType: parent.storage.idStorageSubType
          }});
        if (!allowedType.allowsBoxes) {
          throw new Error("You cannot add a box on this type of storage")
        }

        return await ctx.prisma.$transaction(async (tx: any) => {
          const box = await createBox(tx, args.parentBarcode!, parent, ctx.user);
          return box.barcode;
        });
      },
    }),
    deleteBox: t.boolean({
      authScopes: {
        needPermission: 'canDeleteBox'
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        const box = await ctx.prisma.box.findUnique({where: {barcode: args.barcode}});

        const codes = [{barcode: box.barcode}];
        const status = await callRmmAndGetStatusForDeletion(ctx, codes);
        return await ctx.prisma.$transaction(async (tx: any) => {
          await deleteBox(tx, args.barcode!, ctx.user, status);
          return true;
        });
      },
    }),
    restoreBox: t.boolean({
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
        const parent = await ctx.prisma.box.findUnique({
          where: {barcode: args.barcode!},
          include: {shelf: {include: {storage: true}}}
        });
        if (parent.shelf.deletedBy !== null || parent.shelf.storage.deletedBy !== null) {
          throw new Error("You cannot add a box on a deleted storage or shelf")
        }

        return await ctx.prisma.$transaction(async (tx: any) => {
          await restoreLocation(tx, 'box', args.barcode!);
          return true;
        });
      },
    }),
  }),
});

export async function createBox (transaction: any, barcode: string, parent: {id: number}, user: UserInfo) {
  const lastNumber = await transaction.box.aggregate({where: {idShelf: parent.id}, _max: {numBox: true}});
  const newNumber = lastNumber._max.numBox ? lastNumber._max.numBox + 1 : 1;
  return await transaction.box.create({
    data: {
      idShelf: parent.id,
      barcode: `${barcode} B${newNumber}`,
      numBox: newNumber,
      createdBy: getUserString(user),
      createdOn: new Date(),
      rmmStatus: 'ToBeCreated'
    },
  });
}

export async function deleteBox (transaction: any, barcode: string, user: UserInfo, status: 'ToBeDeleted' | 'Deleted') {
  await transaction.box.update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: getUserString(user),
      deletedOn: new Date(),
      rmmStatus: status
    }
  });
}
