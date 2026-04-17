import express from "express";
import {ApolloServer} from "@apollo/server";
import {schema} from "../libs/prisma/schema";
import {expressMiddleware} from "@as-integrations/express5";

export async function makeServer() {
  const app = express();

  const server = new ApolloServer({
    schema
  });
  await server.start();

  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  return app;
}
