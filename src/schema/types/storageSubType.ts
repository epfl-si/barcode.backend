import {builder} from "../builder";
import {getTypesEnum} from "../../lib/enum";

builder.prismaObject('StorageSubType', {
  name: 'StorageSubType',
  fields: (t: any) => ({
    symbol: t.exposeString('symbol'),
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
        roomSymbol: t.arg.string(),
        productSymbol: t.arg.string(),
        storageSymbol: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {

        (await getTypesEnum(ctx, 'roomType')).optional().parse(args.roomSymbol);
        (await getTypesEnum(ctx, 'productType')).optional().parse(args.productSymbol);
        (await getTypesEnum(ctx, 'storageType')).optional().parse(args.storageSymbol);

        if (args.roomSymbol && args.productSymbol && args.storageSymbol) {
          return await ctx.prisma.storageSubType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    symbol: args.roomSymbol
                  },
                  productType: {
                    symbol: args.productSymbol
                  },
                  storageType: {
                    symbol: args.storageSymbol
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
