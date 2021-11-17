import { ApolloServerBase, Config, ContextFunction } from "apollo-server-core";
import type { Middleware, ParameterizedContext } from "koa";
declare module 'koa' {
    interface Request {
        body?: any;
    }
}
export declare class ApolloServerKoa<KoaContext extends ParameterizedContext, GraphqlContext> extends ApolloServerBase<KoaContext> {
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
    readonly contextType: GraphqlContext;
    constructor(config: Config<KoaContext> & {
        context: ContextFunction<KoaContext, GraphqlContext>;
    });
    getMiddleware(): Middleware;
}
