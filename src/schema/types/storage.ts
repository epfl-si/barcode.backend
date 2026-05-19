import {builder} from "../builder";
import {z} from 'zod';

const StorageRef = builder.prismaObject('Storage', {
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
    shelves: t.relation('shelves', {
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

const StorageListResult = builder.objectRef<{
  totalCount: number;
  storages: any[];
}>('StorageListResult').implement({
  fields: (t) => ({
    totalCount: t.exposeInt('totalCount'),
    storages: t.field({
      type: [StorageRef],
      resolve: (parent) => parent.storages,
    }),
  }),
});

builder.queryType({
  fields: (t) => ({
    storage: t.prismaField({
      type: 'Storage',
      authScopes: {
        needPermission: 'canReadStorage'
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (query, root, args, ctx: any, info) => {
        return ctx.prisma.storage.findUnique({
          where: {
            barcode: args.barcode
          }
        });
      },
    }),
  }),
});

builder.queryField('storages', (t) =>
  t.field({
    type: StorageListResult,
    args: {
      roomTypeSymbol: t.arg.string(),
      productTypeSymbol: t.arg.string(),
      storageTypeSymbol: t.arg.string(),
      storageSubTypeSymbol: t.arg.string(),
      page: t.arg.int(),
      pageSize: t.arg.int(),
      sortField: t.arg.string(),
      sortDirection: t.arg.string(),
    },
    authScopes: {
      needPermission: 'canReadStorage'
    },
    resolve: async (root, args, ctx: any) => {
      const where: any = {};
      if (args.roomTypeSymbol) {
        where.roomType = { symbol: args.roomTypeSymbol }
      }
      if (args.productTypeSymbol) {
        where.productType = { symbol: args.productTypeSymbol }
      }
      if (args.storageTypeSymbol) {
        where.storageType = { symbol: args.storageTypeSymbol}
      }
      if (args.storageSubTypeSymbol) {
        where.storageSubType = { symbol: args.storageSubTypeSymbol }
      }
      const direction = args.sortDirection === 'desc' ? 'desc' : 'asc';
      const orderBy = (() => {
        switch (args.sortField) {
          case 'roomDisplay':
            return { roomDisplay: direction };
          case 'barcode':
            return { barcode: direction };
          case 'roomType':
            return { roomType: { symbol: direction } };
          case 'productType':
            return { productType: { symbol: direction } };
          case 'storageType':
            return { storageType: { symbol: direction } };
          case 'storageSubType':
            return { storageSubType: { symbol: direction } };
          default:
            return { createdOn: 'desc' };
        }
      })();
      const page = Number(args.page ?? 1);
      const pageSize = Number(args.pageSize ?? 50);
      const [totalCount, storages] = await Promise.all([
        ctx.prisma.storage.count({ where }),
        ctx.prisma.storage.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { totalCount, storages };
    },
  })
);

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
    undeleteStorage: t.boolean({
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
        await undeleteStorage(ctx, args.barcode!);
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

async function deleteStorage (context: any, barcode: string) {
  const data = {
    deletedBy: context.user.username,
    deletedOn: new Date()
  };
  const storage = await context.prisma.storage.update({
    where: {
      barcode: barcode
    },
    data: data
  });
  const shelves = (await context.prisma.shelf.findMany({where: {idStorage: storage.id}}))
    .map((shelf: { id: number; }) => shelf.id);
  await context.prisma.shelf.updateMany({
    where: {
      idStorage: storage.id
    },
    data: data
  });
  await context.prisma.box.updateMany({
    where: {
      idShelf: {
        in: shelves
      }
    },
    data: data
  });
}

async function undeleteStorage (context: any, barcode: string) {
  await context.prisma.storage.update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: null,
      deletedOn: null
    }
  });
}
