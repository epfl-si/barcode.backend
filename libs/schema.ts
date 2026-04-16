import {builder} from "./builder";

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

export const schema = builder.toSchema();
