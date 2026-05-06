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
        roomType: t.arg.string(),
        productType: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomType && args.productType) {
          return await ctx.prisma.storageType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    name: args.roomType
                  },
                  productType: {
                    name: args.productType
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
