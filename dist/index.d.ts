import { ApolloServerBase, Config } from "apollo-server-core";
import type { Middleware, ParameterizedContext } from "koa";
declare module 'koa' {
    interface Request {
        body?: any;
    }
}
interface ApolloServerKoaConfig<GraphqlContext> extends Config {
    playground?: false;
    context: (ctx: ParameterizedContext<any, any>) => Promise<GraphqlContext> | GraphqlContext;
}
export declare type ApolloServerKoaGraphqlContext<Server> = Server extends ApolloServerKoa<infer T> ? T : never;
export declare class ApolloServerKoa<GraphqlContext> extends ApolloServerBase {
    constructor(config: ApolloServerKoaConfig<GraphqlContext>);
    protected supportsUploads: () => boolean;
    protected supportsSubscriptions: () => boolean;
    private started;
    private middleware;
    getMiddleware(): Middleware;
}
export {};
