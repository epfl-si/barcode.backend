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
        roomTypeId: t.arg.int(),
      },
      resolve: async (query, root, args, ctx: any, info) => {
        if (args.roomTypeId) {
          return await ctx.prisma.productType.findMany({
            where: {
              allowedTypeValues: {
                some: {
                  idRoomType: args.roomTypeId
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
