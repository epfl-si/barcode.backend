import {builder} from "../builder";
import {z} from 'zod';
import { getRoomsFromApi } from "../../lib/api";

const RoomApiSuggestionRef = builder.objectRef<{ id: number; name: string }>('RoomApiSuggestion').implement({
  fields: (t) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name'),
  }),
});

builder.queryField('suggestRoomApi', (t) =>
  t.field({
    type: [RoomApiSuggestionRef],
    description: 'Fetches room suggestions from API',
    authScopes: {
      needPermission: 'canCreateStorage'
    },
    args: {
      roomSearch: t.arg.string({ required: true, description: 'The partial room name to search for' }),
    },
    validate: z.object({
      roomSearch: z.string().min(2),
    }),
    resolve: async (root, args, ctx: any) => {
      const { roomSearch } = args;
      const data = await getRoomsFromApi(roomSearch);
      if (!data || !data.rooms) {
        return [];
      }
      return data.rooms.map((u: { id: number, name: string }) => ({
        id: Number(u.id),
        name: u.name
      }));
    },
  })
);
