import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { IHttpApi, HttpApi, LambdaProxyIntegration, PayloadFormatVersion } from '@aws-cdk/aws-apigatewayv2';
import { LogGroup } from '@aws-cdk/aws-logs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as path from 'path';
import * as iam from '@aws-cdk/aws-iam';
import * as route53 from '@aws-cdk/aws-route53';
import { LogGroupLogDestination } from '@aws-cdk/aws-apigateway';

export enum ApiGatewayVersion {
  REST_API,
  HTTP_API,
}

export interface ServerlessEcrProxyProps {
  /**
   * registry id for Amazon ECR to be proxied
   */
  readonly registryId: string
  /**
   * The name of API Gateway
   * 
   * @default `ecr-proxy-${registryId}`
   */
  readonly name?: string
  /**
   * Route 53 hosted zone ID for custom domain name
   */
  readonly zone?: route53.IHostedZone
  /**
   * API Gateway API REST API or HTTP API
   * 
   * @default REST_API
   */
  readonly apiGatewayVersion?: ApiGatewayVersion
  /**
   * The CloudWatch log group for access log
   */
  readonly logGroup?: LogGroup 
   /**
    * API Gateway domain name options for custom domain
    */
   readonly domain?: apigateway.DomainNameOptions
}

export interface IECRProxy {
  /**
   * Endpoint of ECR proxy.
   */
  readonly endpoint: string;
}

export class ApigatewayHttpApi extends cdk.Resource implements IECRProxy {

  // for API Gateway HTTP API(v2)
  readonly api: IHttpApi;
  readonly endpoint: string;

  constructor(scope: cdk.Construct, id: string, props: ApiProps) {
    super(scope, id)
    const api = new HttpApi(scope, props.name, {
      defaultIntegration: new LambdaProxyIntegration({
        handler: props.handler,
        payloadFormatVersion: PayloadFormatVersion.VERSION_1_0,
      }),
      createDefaultStage: false,
    })

    api.addStage('StageV2', {
      autoDeploy: true,
      stageName: 'v2'
    })

    this.endpoint = `${api.httpApiId}.execute-api.${cdk.Stack.of(this).region}.${cdk.Stack.of(this).urlSuffix}`;
    this.api = api;
  }
}


export interface ApiProps {
  readonly name: string,
  readonly handler: lambda.IFunction,
  readonly domain?: apigateway.DomainNameOptions,
  readonly logGroup?: LogGroup,
}

export class ApigatewayRestApi extends cdk.Resource implements IECRProxy {
  // for API Gateway REST API(v1)
  readonly api: apigateway.RestApi;
  readonly endpoint: string;
  constructor(scope: cdk.Construct, id: string,  props: ApiProps) {
    super(scope, id)

    this.api = new apigateway.LambdaRestApi(scope, props.name, {
      handler: props.handler,
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL]
      },
      deployOptions: {
        stageName: 'v2',
        accessLogDestination: props.logGroup ? 
          new LogGroupLogDestination(props.logGroup) : undefined,
      },
      domainName: props?.domain,
    })

    this.endpoint =  `${this.api.restApiId}.execute-api.${cdk.Stack.of(this).region}.${cdk.Stack.of(this).urlSuffix}`;
  }
}

export class ServerlessEcrProxy extends cdk.Resource{
  readonly ecrProxy: IECRProxy
  constructor(scope: cdk.Construct, id: string, props: ServerlessEcrProxyProps) {
    super(scope, id);

    const handler = new lambda.Function(this, `LambdaFn-${props.registryId}`, {
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda.d')),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'lambda.handler',
      environment: {
        registry_id: props.registryId
      }
    })

    handler.role!.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage',
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability"
      ],
      resources: [ '*' ]
    }))

    const apiProps = {
      handler,
      name: props.name ? props.name : `ecr-proxy-${props.registryId}`,
      domain: props?.domain,
      logGroup: props.logGroup,
    };

    if (props.apiGatewayVersion === ApiGatewayVersion.HTTP_API) {
      const httpApi = new ApigatewayHttpApi(this, `HttpApi-${props.registryId}`, apiProps)
      this.ecrProxy = httpApi
    } else {
      const restApi = new ApigatewayRestApi(this, `RestApi-${props.registryId}`, apiProps)
      this.ecrProxy = restApi
    }
    
    new cdk.CfnOutput(scope, `ProxyURL-${props.registryId}`, { 
      value: this.ecrProxy.endpoint,
      exportName: `${cdk.Stack.of(this).stackName}-RegistryEndpoint-${props.registryId}`, 
    })
  }
}
