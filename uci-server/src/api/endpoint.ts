export interface IEndpoint {
    params(): EndpointParameters;
    createHandler(): IEndpointHandler;
}

export interface IEndpointHandler {
    validate(data: any): string | null;
    parse(data: any): void;
    execute(): Promise<any>;
}

export type EndpointParameters = {
    route: string
};