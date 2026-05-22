import {builder} from "../builder";
import {z} from 'zod';

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
      validate: z.object({
        roomSymbol: z.string().nonempty(),
        productSymbol: z.string().nonempty(),
        storageSymbol: z.string().nonempty(),
        subStorageSymbol: z.string().nonempty()
      }),
      resolve: async (query, root, args, ctx: any, info) => {
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
