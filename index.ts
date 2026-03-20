import express from "express";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@as-integrations/express5";
import {schema} from "./libs/schema";

async function startServer() {
	const app = express();

	const server = new ApolloServer({ schema });

	await server.start();

	app.use(express.json());
	app.use('/graphql', expressMiddleware(server));

	app.listen(4000, () => {
		console.log('Server running at http://localhost:4000/graphql');
	});
}

startServer();
