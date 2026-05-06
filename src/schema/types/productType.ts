import {builder} from "../builder";

builder.prismaObject('ProductType', {
  name: 'ProductType',
  fields: (t: any) => ({
    name: t.exposeString('name'),
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
        roomTypeShortName: t.arg.string(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomTypeShortName) {
          return await ctx.prisma.productType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  roomType: {
                    shortName: args.roomTypeShortName
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
