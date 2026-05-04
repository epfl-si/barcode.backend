import {builder} from "../builder";

builder.prismaObject('Box', {
  name: 'Box',
  fields: (t: any) => ({
    barcode: t.exposeString('barcode'),
  }),
});
