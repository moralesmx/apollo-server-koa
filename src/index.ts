import { ApolloServerBase, Config, ContextFunction, convertNodeHttpToRequest, formatApolloErrors, HttpQueryError, runHttpQuery } from "apollo-server-core";
import type { Middleware, ParameterizedContext } from "koa";

declare module 'koa' {
  interface Request {
    body?: any;
  }
}

function isHttpQueryError(error: Error): error is HttpQueryError {
  return error.name === 'HttpQueryError';
}

interface ApolloServerKoaConfig<KoaContext, GraphqlContext> extends Config {
  playground?: false;
  context: ContextFunction<KoaContext, GraphqlContext>;
}

export type ApolloServerKoaGraphqlContext<Server> = Server extends ApolloServerKoa<any, infer T> ? T : never;

export class ApolloServerKoa<KoaContext extends ParameterizedContext, GraphqlContext> extends ApolloServerBase {

  constructor(config: ApolloServerKoaConfig<KoaContext, GraphqlContext>) {
    super({
      ...config,
      playground: false,
    });
  }

  protected supportsUploads = () => true;
  protected supportsSubscriptions = () => true;

  private started = this.willStart();

  private middleware: Middleware = async ctx => {
    await this.started;
    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([ctx], {
        query: ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
        method: ctx.request.method,
        request: convertNodeHttpToRequest(ctx.req),
        options: await this.graphQLServerOptions(ctx),
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
