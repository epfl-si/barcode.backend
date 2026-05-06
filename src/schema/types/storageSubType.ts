import {builder} from "../builder";

builder.prismaObject('StorageSubType', {
  name: 'StorageSubType',
  fields: (t: any) => ({
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
        roomTypeShortName: t.arg.string(),
        productTypeShortName: t.arg.string(),
        storageTypeShortName: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomTypeShortName && args.productTypeShortName && args.storageTypeShortName) {
          return await ctx.prisma.storageSubType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    shortName: args.roomTypeShortName
                  },
                  productType: {
                    shortName: args.productTypeShortName
                  },
                  storageType: {
                    shortName: args.storageTypeShortName
                  }
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
