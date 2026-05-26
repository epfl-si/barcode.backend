import {builder} from "../builder";
import {getTypesEnum} from "../../lib/enum";

builder.prismaObject('AllowedTypeValue', {
  name: 'AllowedTypeValue',
  fields: (t: any) => ({
    allowsShelves: t.boolean('allowsShelves'),
    allowsBoxes: t.boolean('allowsBoxes')
  }),
});

builder.queryType({
  fields: (t) => ({
    allowedTypeValue: t.prismaField({
      type: 'AllowedTypeValue',
      authScopes: {
        needPermission: 'canReadTypes'
      },
      args: {
        roomSymbol: t.arg.string(),
        productSymbol: t.arg.string(),
        storageSymbol: t.arg.string(),
        subStorageSymbol: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {

        (await getTypesEnum(ctx, 'roomType')).parse(args.roomSymbol);
        (await getTypesEnum(ctx, 'productType')).parse(args.productSymbol);
        (await getTypesEnum(ctx, 'storageType')).parse(args.storageSymbol);
        (await getTypesEnum(ctx, 'storageSubType')).parse(args.subStorageSymbol);

        return await ctx.prisma.allowedTypeValue.findFirst({
          where: {
            roomType: {
              symbol: args.roomSymbol
            },
            productType: {
              symbol: args.productSymbol
            },
            storageType: {
              symbol: args.storageSymbol
            },
            storageSubType: {
              symbol: args.subStorageSymbol
            }
          }
        });
      },
    }),
  }),
});
