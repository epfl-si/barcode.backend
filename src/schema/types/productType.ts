import {builder} from "../builder";

builder.prismaObject('ProductType', {
  name: 'ProductType',
  fields: (t: any) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName')
  }),
});
