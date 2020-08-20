import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { IHttpApi } from '@aws-cdk/aws-apigatewayv2';
import { LogGroup } from '@aws-cdk/aws-logs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as route53 from '@aws-cdk/aws-route53';
export declare enum ApiGatewayVersion {
    REST_API = 0,
    HTTP_API = 1
}
export interface ServerlessEcrProxyProps {
    /**
     * registry id for Amazon ECR to be proxied
     */
    readonly registryId: string;
    /**
     * The name of API Gateway
     *
     * @default `ecr-proxy-${registryId}`
     */
    readonly name?: string;
    /**
     * Route 53 hosted zone ID for custom domain name
     */
    readonly zone?: route53.IHostedZone;
    /**
     * API Gateway API REST API or HTTP API
     *
     * @default REST_API
     */
    readonly apiGatewayVersion?: ApiGatewayVersion;
    /**
     * The CloudWatch log group for access log
     */
    readonly logGroup?: LogGroup;
    /**
     * API Gateway domain name options for custom domain
     */
    readonly domain?: apigateway.DomainNameOptions;
}
export interface IECRProxy {
    /**
     * Endpoint of ECR proxy.
     */
    readonly endpoint: string;
}
export declare class ApigatewayHttpApi extends cdk.Resource implements IECRProxy {
    readonly api: IHttpApi;
    readonly endpoint: string;
    constructor(scope: cdk.Construct, id: string, props: ApiProps);
}
export interface ApiProps {
    readonly name: string;
    readonly handler: lambda.IFunction;
    readonly domain?: apigateway.DomainNameOptions;
    readonly logGroup?: LogGroup;
}
export declare class ApigatewayRestApi extends cdk.Resource implements IECRProxy {
    readonly api: apigateway.RestApi;
    readonly endpoint: string;
    constructor(scope: cdk.Construct, id: string, props: ApiProps);
}
export declare class ServerlessEcrProxy extends cdk.Resource {
    readonly ecrProxy: IECRProxy;
    constructor(scope: cdk.Construct, id: string, props: ServerlessEcrProxyProps);
}
