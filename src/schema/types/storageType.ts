import {builder} from "../builder";

builder.prismaObject('StorageType', {
  name: 'StorageType',
  fields: (t: any) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName')
  }),
});

builder.queryType({
  fields: (t) => ({
    storageTypes: t.prismaField({
      type: ['StorageType'],
      authScopes: {
        needPermission: 'canReadTypes'
      },
      args: {
        roomTypeId: t.arg.int(),
        productTypeId: t.arg.int(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomTypeId && args.productTypeId) {
          return await ctx.prisma.storageType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  idRoomType: args.roomTypeId,
                  idProductType: args.productTypeId,
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
        } else {
          return await ctx.prisma.storageType.findMany();
        }
      },
    }),
  }),
});
