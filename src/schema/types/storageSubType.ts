import {builder} from "../builder";

builder.prismaObject('StorageSubType', {
  name: 'StorageSubType',
  fields: (t: any) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName')
  }),
});

builder.queryType({
  fields: (t) => ({
    storageSubTypes: t.prismaField({
      type: ['StorageSubType'],
      authScopes: {
        needPermission: 'canReadTypes'
      },
      args: {
        roomTypeId: t.arg.int(),
        productTypeId: t.arg.int(),
        storageTypeId: t.arg.int(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomTypeId && args.productTypeId && args.storageTypeId) {
          return await ctx.prisma.storageSubType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  idRoomType: args.roomTypeId,
                  idProductType: args.productTypeId,
                  idStorageType: args.storageTypeId
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
        } else {
          return await ctx.prisma.storageSubType.findMany();
        }
      },
    }),
  }),
});
