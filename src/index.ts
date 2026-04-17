import {makeServer} from "./server";

const start = async () => {
  const server = await makeServer();

  server.listen(4000, () => {
    console.log('Server running at http://localhost:4000/graphql');
  });
};

start();
