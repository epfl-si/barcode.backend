import {builder} from "../builder";

builder.prismaObject('StorageType', {
  name: 'StorageType',
  fields: (t: any) => ({
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
        roomTypeShortName: t.arg.string(),
        productTypeShortName: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomTypeShortName && args.productTypeShortName) {
          return await ctx.prisma.storageType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    shortName: args.roomTypeShortName
                  },
                  productType: {
                    shortName: args.productTypeShortName
                  }
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
