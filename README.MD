# Apollo Server for Koa
Apollo GraphQL Server for Koa, a less oppinionated approach, use your own routing, cors and body parsing middleware.

## Example
```ts
import * as Koa from 'koa';
import * as KoaCors from '@koa/cors';
import * as KoaRouter from '@koa/router';
import * as KoaBodyParser from 'koa-bodyparser';
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

// Use your own routing middleware
const router = new KoaRouter();
router.get('/graphql', apollo.getMiddleware());
router.post('/graphql', apollo.getMiddleware());

const koa = new Koa();
koa.use(KoaCors()); // Use your own CORS middleware
koa.use(KoaBodyParser()); // Use your own body parsing middleware
koa.use(router.routes());
koa.use(router.allowedMethods());

koa.listen(8080, () => {
  console.log(`GraphQL Server ready at http://localhost:8080/graphql`);
});
```