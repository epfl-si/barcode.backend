import {prisma} from "../libs/prisma/prisma";
import {builder} from "../libs/prisma/builder";
import { z } from 'zod';

builder.prismaObject('Inventory', {
  name: 'GetInventory',
  fields: (t: any) => ({
    id: t.exposeID('id_storage'),
    barcode: t.exposeString('barcode'),
  }),
});

builder.queryType({
  fields: (t) => ({
    inventoryList: t.prismaField({
      type: 'Inventory',
      resolve: async (query, root, args, ctx, info) => {
        return prisma.inventory.findFirst();
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createInventory: t.boolean({
      args: {
        barcode: t.arg.string(),
      },
      validate: z.object({
        barcode: z.string().nonempty(),
      }),
      resolve: async (root, args) => {
        await prisma.inventory.create({
          data: {
            barcode: args.barcode!,
          }
        });
        return true;
      },
    }),
  }),
});
