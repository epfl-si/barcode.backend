import {builder} from "../builder";

builder.prismaObject('RoomType', {
  name: 'RoomType',
  fields: (t: any) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName')
  }),
});
