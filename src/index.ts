import { ApolloServerBase, Config, convertNodeHttpToRequest, formatApolloErrors, HttpQueryError, runHttpQuery } from "apollo-server-core";
import { processRequest } from 'graphql-upload';
import type { Middleware, ParameterizedContext } from "koa";

declare module 'koa' {
  interface Request {
    body?: any;
  }
}

function isHttpQueryError(error: Error): error is HttpQueryError {
  return error.name === 'HttpQueryError';
}

interface ApolloServerKoaConfig<GraphqlContext> extends Config {
  playground?: false;
  context: (ctx: ParameterizedContext<any, any>) => Promise<GraphqlContext> | GraphqlContext;
}

export type ApolloServerKoaGraphqlContext<Server> = Server extends ApolloServerKoa<infer T> ? T : never;

export class ApolloServerKoa<GraphqlContext> extends ApolloServerBase {

  constructor(config: ApolloServerKoaConfig<GraphqlContext>) {
    super({
      ...config,
      playground: false,
      context: ({ ctx }) => config.context(ctx),
    });
  }

  protected supportsUploads = () => true;
  protected supportsSubscriptions = () => true;

  private started = this.willStart();

  private middleware: Middleware = async ctx => {
    await this.started;
    if (ctx.request.is('multipart/form-data')) {
      try {
        ctx.request.body = await processRequest(ctx.req, ctx.res, this.uploadsConfig);
      } catch (error) {
        if (error.status && error.expose) {
          ctx.response.status = error.status;
        }
        throw formatApolloErrors([error], {
          formatter: this.requestOptions.formatError,
          debug: this.requestOptions.debug,
        });
      }
    }
    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([ctx], {
        query: ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
        method: ctx.request.method,
        request: convertNodeHttpToRequest(ctx.req),
        options: await this.graphQLServerOptions({ ctx }),
      });
      ctx.response.set(responseInit.headers || {});
      ctx.response.body = graphqlResponse;
    } catch (error) {
      if (!isHttpQueryError(error)) {
        throw error;
      }
      ctx.response.set(error.headers || {});
      ctx.response.body = error.message;
      ctx.response.status = error.statusCode;
    }
  };

  public getMiddleware(): Middleware {
    return this.middleware;
  }

}
