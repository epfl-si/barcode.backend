import {builder} from "../builder";

builder.prismaObject('StorageType', {
  name: 'StorageType',
  fields: (t: any) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName')
  }),
});
