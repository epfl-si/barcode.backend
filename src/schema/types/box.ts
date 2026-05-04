import {builder} from "../builder";
import {z} from 'zod';

builder.prismaObject('Box', {
  name: 'Box',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createBox: t.boolean({
      authScopes: {
        needPermission: 'canCreateStorage'
      },
      args: {
        // TODO add shelf barcode
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await ctx.prisma.box.create({
          data: {
            // TODO add id shelf after get it from barcode
            barcode: args.barcode!,
          },
        });
        return true;
      },
    }),
    deleteBox: t.boolean({
      authScopes: {
        needPermission: 'canDeleteStorage'
      },
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args, ctx: any) => {
        await ctx.prisma.box.delete({
          where: {
            barcode: args.barcode!,
          },
        });
        return true;
      },
    }),
  }),
});
