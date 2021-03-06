# Apollo Server for Koa
Apollo GraphQL Server for Koa, a less oppinionated approach, use your own cors, routing, body parsing and file uploads middleware.

## Example
```ts
import * as Koa from 'koa';
import * as KoaCors from '@koa/cors'; // Use your own CORS middleware
import * as KoaRouter from '@koa/router'; // Use your own routing middleware
import * as KoaBodyParser from 'koa-bodyparser'; // Use your own body parsing middleware
import { graphqlUploadKoa } from "graphql-upload"; // Use your own file uploads middleware
import gql from 'graphql-tag';
import { ApolloServerKoa } from 'apollo-server-koa';

const apollo = new ApolloServerKoa({ 
  typeDefs: gql`
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'Hello world!',
    },
  },
  context: ctx => ctx 
});

const router = new KoaRouter();
router.use('/graphql', graphqlUploadKoa());
router.get('/graphql', apollo.getMiddleware());
router.post('/graphql', apollo.getMiddleware()); 

const koa = new Koa();
koa.use(KoaCors());
koa.use(KoaBodyParser());
koa.use(router.routes());
koa.use(router.allowedMethods());

koa.listen(8080, () => {
  console.log(`GraphQL Server ready at http://localhost:8080/graphql`);
});
```
