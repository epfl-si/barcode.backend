import {builder} from "../builder";
import {z} from 'zod';

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
        const box = await createBox(ctx, args.parentBarcode!);
        return box.barcode;
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
        await deleteBox(ctx, args.barcode!);
        return true;
      },
    }),
    undeleteBox: t.boolean({
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
        await undeleteBox(ctx, args.barcode!);
        return true;
      },
    }),
  }),
});

export async function createBox (context: any, barcode: string) {
  const parent = await context.prisma.shelf.findUnique({where: {barcode: barcode}});
  const lastNumber = await context.prisma.box.aggregate({where: {idShelf: parent.id}, _max: {numBox: true}});
  const newNumber = lastNumber._max.numBox ? lastNumber._max.numBox + 1 : 1;
  return await context.prisma.box.create({
    data: {
      idShelf: parent.id,
      barcode: `${barcode} B${newNumber}`,
      numBox: newNumber,
      createdBy: context.user.username,
      createdOn: new Date()
    },
  });
}

export async function deleteBox (context: any, barcode: string) {
  await context.prisma.box.update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: context.user.username,
      deletedOn: new Date()
    }
  });
}

export async function undeleteBox (context: any, barcode: string) {
  await context.prisma.box.update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: null,
      deletedOn: null
    }
  });
}
