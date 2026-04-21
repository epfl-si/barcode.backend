import {builder} from "../builder";

builder.objectType('User', {
  fields: (t) => ({
    groups: t.stringList(),
    username: t.string(),
    isAdmin: t.boolean(),
    isCosec: t.boolean(),
    isReadOnly: t.boolean(),
  }),
});

builder.queryType({
  fields: (t) => ({
    connectedUserInfo: t.field({
      type: 'User',
      nullable: true,
      resolve: (root, args, ctx) => {
        return ctx.user;
      },
    }),
  }),
});
