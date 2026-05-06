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
        roomType: t.arg.string(),
        productType: t.arg.string(),
        storageType: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomType && args.productType && args.storageType) {
          return await ctx.prisma.storageSubType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    name: args.roomType
                  },
                  productType: {
                    name: args.productType
                  },
                  storageType: {
                    name: args.storageType
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
