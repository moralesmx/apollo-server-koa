import { ApolloServerBase, Config, ContextFunction } from "apollo-server-core";
import type { Middleware, ParameterizedContext } from "koa";
declare module 'koa' {
    interface Request {
        body?: any;
    }
}
interface ApolloServerKoaConfig<KoaContext, GraphqlContext> extends Config {
    playground?: false;
    context: ContextFunction<KoaContext, GraphqlContext>;
}
export declare type ApolloServerKoaGraphqlContext<Server> = Server extends ApolloServerKoa<any, infer T> ? T : never;
export declare class ApolloServerKoa<KoaContext extends ParameterizedContext, GraphqlContext> extends ApolloServerBase {
    constructor(config: ApolloServerKoaConfig<KoaContext, GraphqlContext>);
    protected supportsUploads: () => boolean;
    protected supportsSubscriptions: () => boolean;
    private started;
    private middleware;
    getMiddleware(): Middleware;
}
export {};
