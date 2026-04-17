import {makeServer} from "./server";

const start = async () => {
  const server = await makeServer();

  server.listen(4010, () => {
    console.log('Server running at http://localhost:4010/graphql');
  });
};

start();
