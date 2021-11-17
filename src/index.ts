import { ApolloServerBase, Config, ContextFunction, convertNodeHttpToRequest, isHttpQueryError, runHttpQuery } from "apollo-server-core";
import type { Middleware, ParameterizedContext } from "koa";

declare module 'koa' {
  interface Request {
    body?: any;
  }
}

export class ApolloServerKoa<KoaContext extends ParameterizedContext, GraphqlContext> extends ApolloServerBase<KoaContext> {

  /**
   * Use this property to get graphql context type only.
   *
   * ```ts
   * type KoaContext = ParameterizedContext<{ user: string }>;
   *
   * const server = new ApolloServerKoa({
   *   context: (ctx: KoaContext) => ({
   *     user: ctx.state.user,
   *     otherProperty: 'otherValue',
   *   }),
   * });
   *
   * type GraphqlContext = typeof server.contextType; // { user: string, otherProperty: string }
   * ```
   */
  public readonly contextType!: GraphqlContext;

  constructor(config: Config<KoaContext> & {
    context: ContextFunction<KoaContext, GraphqlContext>;
  }) {
    super(config);
  }

  public getMiddleware(): Middleware {
    return async ctx => {
      try {
        const { graphqlResponse, responseInit } = await runHttpQuery([ctx], {
          query: ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
          method: ctx.request.method,
          request: convertNodeHttpToRequest(ctx.req),
          options: await this.graphQLServerOptions(ctx),
        });
        ctx.response.set(responseInit.headers || {});
        ctx.response.body = graphqlResponse;
        ctx.response.status = responseInit.status || 200;
      } catch (error) {
        if (!isHttpQueryError(error)) {
          throw error;
        }
        ctx.response.set(error.headers || {});
        ctx.response.body = error.message;
        ctx.response.status = error.statusCode;
      }
    };
  }

}
