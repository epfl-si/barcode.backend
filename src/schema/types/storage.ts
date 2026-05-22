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
      authScopes: {
        needPermission: 'canReadShelf'
      },
      query: (args:{}, ctx: any) => ({
        where: {
          deletedOn: ctx.user.isAdmin ? undefined : null,
        },
        orderBy: {
          barcode: 'asc'
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
      const where: any = {
        deletedOn: ctx.user.isAdmin ? undefined : null,
      };
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
    createStorage: t.string({
      authScopes: {
        needPermission: 'canCreateStorage'
      },
      args: {
        roomId: t.arg.int(),
        roomDisplay: t.arg.string(),
        roomType: t.arg.string(),
        productType: t.arg.string(),
        storageType: t.arg.string(),
        storageSubType: t.arg.string(),
      },
      validate: z.object({
        roomId: z.int().nonnegative(),
        roomDisplay: z.string().nonempty(),
        roomType: z.string().nonempty(),
        productType: z.string().nonempty(),
        storageType: z.string().nonempty(),
        storageSubType: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        const storage = await createStorage(ctx, args.roomDisplay!, args.roomId!, args.roomType!, args.productType!, args.storageType!, args.storageSubType!);
        return storage.barcode;
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
    restoreStorage: t.boolean({
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
        await restoreStorage(ctx, args.barcode!);
        return true;
      },
    }),
  }),
});

async function createStorage (context: any, roomDisplay: string, roomId: number, roomType: string, productType: string, storageType: string, storageSubType: string) {
  const roomTypeObj = await context.prisma.roomType.findUnique({where: {symbol: roomType}});
  const productTypeObj = await context.prisma.productType.findUnique({where: {symbol: productType}});
  const storageTypeObj = await context.prisma.storageType.findUnique({where: {symbol: storageType}});
  const storageSubTypeObj = await context.prisma.storageSubType.findUnique({where: {symbol: storageSubType}});

  const lastNumber = await context.prisma.storage.aggregate({
    where: {
      roomId: roomId,
      idRoomType: roomTypeObj.id,
      idProductType: productTypeObj.id,
      idStorageType: storageTypeObj.id
    }, _max: {numStorage: true}});
  const newNumber = lastNumber._max.numStorage ? lastNumber._max.numStorage + 1 : 1;

  return await context.prisma.storage.create({
    data: {
      barcode: `${roomDisplay} ${roomTypeObj.shortName}${productTypeObj.shortName} ${storageTypeObj.shortName}${newNumber} ${storageSubTypeObj.shortName}`,
      numStorage: newNumber,
      roomId: roomId,
      roomDisplay: roomDisplay,
      idRoomType: roomTypeObj.id,
      idProductType: productTypeObj.id,
      idStorageType: storageTypeObj.id,
      idStorageSubType: storageSubTypeObj.id,
      createdBy: context.user.username,
      createdOn: new Date(),
    },
  });
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

async function restoreStorage (context: any, barcode: string) {
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
