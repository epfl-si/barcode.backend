import {builder} from "../builder";

builder.prismaObject('RoomType', {
  name: 'RoomType',
  fields: (t: any) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName')
  }),
});

builder.queryType({
  fields: (t) => ({
    roomTypes: t.prismaField({
      type: ['RoomType'],
      authScopes: {
        needPermission: 'canReadTypes'
      },
      resolve: async (query, root, args, ctx: any, info) => {
        return await ctx.prisma.roomType.findMany();
      },
    }),
  }),
});
