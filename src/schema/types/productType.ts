import {builder} from "../builder";

builder.prismaObject('ProductType', {
  name: 'ProductType',
  fields: (t: any) => ({
    symbol: t.exposeString('symbol'),
    shortName: t.exposeString('shortName')
  }),
});

builder.queryType({
  fields: (t) => ({
    productTypes: t.prismaField({
      type: ['ProductType'],
      authScopes: {
        needPermission: 'canReadTypes'
      },
      args: {
        roomSymbol: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomSymbol) {
          return await ctx.prisma.productType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    symbol: args.roomSymbol
                  }
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
        } else {
          return await ctx.prisma.productType.findMany();
        }
      },
    }),
  }),
});
