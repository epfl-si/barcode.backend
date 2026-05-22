import {builder} from "../builder";
import {z} from 'zod';
import {getTypesEnum} from "../../lib/enum";

export async function getRoomsFromApi(search: string): Promise<any> {
  const url = `https://api.epfl.ch/v1/rooms?query=${search}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${process.env.API_USER}:${process.env.API_PASSWORD}`).toString('base64')
    }
  });

  if (!response.ok) {
    throw new Error(`Error during fetching: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

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
      roomDisplay: t.arg.string(),
      page: t.arg.int(),
      pageSize: t.arg.int(),
      sortField: t.arg.string(),
      sortDirection: t.arg.string(),
    },
    validate: z.object({
      roomTypeSymbol: z.string().optional(),
      productTypeSymbol: z.string().optional(),
      storageTypeSymbol: z.string().optional(),
      storageSubTypeSymbol: z.string().optional(),
      page: z.int().nonnegative().optional(),
      pageSize: z.int().nonnegative().optional(),
      sortField: z.enum(["barcode", "roomDisplay", "roomType", "productType", "storageType", "storageSubType", "createdBy", "createdOn", "deletedBy"]).optional(),
      sortDirection: z.enum(["asc","desc"]).optional()
    }),
    authScopes: {
      needPermission: 'canReadStorage'
    },
    resolve: async (root, args, ctx: any) => {

      (await getTypesEnum(ctx, 'roomType', true)).optional().parse(args.roomTypeSymbol);
      (await getTypesEnum(ctx, 'productType', true)).optional().parse(args.productTypeSymbol);
      (await getTypesEnum(ctx, 'storageType', true)).optional().parse(args.storageTypeSymbol);
      (await getTypesEnum(ctx, 'storageSubType', true)).optional().parse(args.storageSubTypeSymbol);

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
      if (args.roomDisplay) {
        where.roomDisplay = args.roomDisplay;
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

builder.queryField('suggestStorage', (t) =>
  t.stringList({
    description: 'Returns a list of text suggestions for autocomplete features',
    authScopes: {
      needPermission: 'canReadStorage'
    },
    args: {
      field: t.arg.string({ required: true, description: 'The database field to search on (e.g., barcode, roomDisplay)' }),
      searchText: t.arg.string({ required: true, description: 'The partial text input provided by the user' }),
    },
    validate: z.object({
      field: z.enum(['barcode', 'roomDisplay']),
      searchText: z.string().min(2),
    }),
    resolve: async (root, args, ctx: any) => {
      const { field, searchText } = args;
      const results = await ctx.prisma.storage.findMany({
        where: {
          [field]: {
            contains: searchText,
            mode: 'insensitive',
          },
          deletedOn: null,
        },
        select: {
          [field]: true,
        },
        distinct: [field],
        take: 10,
        orderBy: {
          [field]: 'asc'
        }
      });
      return results.map((item: any) => item[field]);
    },
  })
);

builder.queryField('suggestRoomApi', (t) =>
  t.stringList({
    description: 'Fetches room suggestions from API',
    authScopes: {
      needPermission: 'canReadStorage'
    },
    args: {
      roomSearch: t.arg.string({ required: true, description: 'The partial room name to search for' }),
    },
    validate: z.object({
      roomSearch: z.string().min(2),
    }),
    resolve: async (root, args, ctx: any) => {
      const { roomSearch } = args;
      try {
        const data = await getRoomsFromApi(roomSearch);
        if (!data || !data.rooms) {
          return [];
        }
        return data.rooms.map((u: any) => u.name);
      } catch (error) {
        console.error("Error retrievings rooms :", error);

        return [];
      }
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

        (await getTypesEnum(ctx, 'roomType')).parse(args.roomType);
        (await getTypesEnum(ctx, 'productType')).parse(args.productType);
        (await getTypesEnum(ctx, 'storageType')).parse(args.storageType);
        (await getTypesEnum(ctx, 'storageSubType')).parse(args.storageSubType);

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
      createdBy: `${context.user.familyName} ${context.user.givenName} (${context.user.sciper})`,
      createdOn: new Date(),
    },
  });
}

async function deleteStorage (context: any, barcode: string) {
  const data = {
    deletedBy: `${context.user.familyName} ${context.user.givenName} (${context.user.sciper})`,
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
