import express from "express";
import {ApolloServer} from "@apollo/server";
import {schema} from "../libs/prisma/schema";
import {expressMiddleware} from "@as-integrations/express5";
import {formatPrismaError} from "../libs/errors";

export async function makeServer() {
  const app = express();

  const server = new ApolloServer({
    schema,
    formatError(formattedError, error: any) {
      console.error('Server error:', error, error.originalError);
      const {errorCode, errorMessage} = formatPrismaError(formattedError, error);
      return {extensions: {code: errorCode}, message: errorMessage};
    }
  });
  await server.start();

  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  return app;
}
