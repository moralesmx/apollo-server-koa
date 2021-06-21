"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloServerKoa = void 0;
const apollo_server_core_1 = require("apollo-server-core");
function isHttpQueryError(error) {
    return error.name === 'HttpQueryError';
}
class ApolloServerKoa extends apollo_server_core_1.ApolloServerBase {
    constructor(config) {
        super(Object.assign(Object.assign({}, config), { playground: false }));
        this.supportsUploads = () => true;
        this.supportsSubscriptions = () => true;
        this.started = this.willStart();
        this.middleware = (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield this.started;
            try {
                const { graphqlResponse, responseInit } = yield apollo_server_core_1.runHttpQuery([ctx], {
                    query: ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
                    method: ctx.request.method,
                    request: apollo_server_core_1.convertNodeHttpToRequest(ctx.req),
                    options: yield this.graphQLServerOptions(ctx),
                });
                ctx.response.set(responseInit.headers || {});
                ctx.response.body = graphqlResponse;
            }
            catch (error) {
                if (!isHttpQueryError(error)) {
                    throw error;
                }
                ctx.response.set(error.headers || {});
                ctx.response.body = error.message;
                ctx.response.status = error.statusCode;
            }
        });
    }
    getMiddleware() {
        return this.middleware;
    }
}
exports.ApolloServerKoa = ApolloServerKoa;
