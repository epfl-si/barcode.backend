import {builder} from "../builder";
import {getTypesEnum} from "../../lib/enum";

builder.prismaObject('StorageType', {
  name: 'StorageType',
  fields: (t: any) => ({
    symbol: t.exposeString('symbol'),
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
        roomSymbol: t.arg.string(),
        productSymbol: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {

        (await getTypesEnum(ctx, 'roomType')).optional().parse(args.roomSymbol);
        (await getTypesEnum(ctx, 'productType')).optional().parse(args.productSymbol);

        if (args.roomSymbol && args.productSymbol) {
          return await ctx.prisma.storageType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    symbol: args.roomSymbol
                  },
                  productType: {
                    symbol: args.productSymbol
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
