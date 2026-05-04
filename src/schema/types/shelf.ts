import {builder} from "../builder";

builder.prismaObject('Shelf', {
  name: 'Shelf',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
    boxes: t.relation('boxes')
  }),
});
