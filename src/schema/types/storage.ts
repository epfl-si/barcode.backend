import {builder} from "../builder";
import {z} from 'zod';

builder.prismaObject('Storage', {
  name: 'Storage',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
    roomDisplay: t.exposeString('roomDisplay'),
    roomType: t.relation('roomType'),
    productType: t.relation('productType'),
    storageType: t.relation('storageType'),
    storageSubType: t.relation('storageSubType'),
    createdBy: t.exposeString('createdBy'),
    createdOn: t.expose('createdOn', { type: 'DateTime' }),
    deletedBy: t.exposeString('deletedBy'),
    deletedOn: t.expose('deletedOn', { type: 'DateTime', nullable: true }),
    shelves: t.relation('shelves')
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
        // TODO add all other fields
      },
      validate: z.object({
        barcode: z.string().nonempty(),
        // TODO add all other fields
      }),
      resolve: async (root, args, ctx: any) => {
        await createStorage(ctx, args.barcode!);
        return true;
      },
    }),
    deleteStorage: t.boolean({
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
        await deleteStorage(ctx, args.barcode!);
        return true;
      },
    }),
  }),
});


async function createStorage (ctx: any, barcode: string) {
  await ctx.prisma.storage.create({
    data: {
      barcode: barcode
      // TODO add all other fields
    },
  });
  // TODO create boxes and shelves in cascade after saving storages
}

async function deleteStorage (ctx: any, barcode: string) {
  // TODO delete boxes and shelves in cascade before deleting storages
  await ctx.prisma.storage.delete({
    where: {
      barcode: barcode
    },
  });
}
