import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';
import { LogGroup } from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import * as CdkLib from '../lib/index';
import '@aws-cdk/assert/jest';
import { ApiGatewayVersion } from '../lib/index';

describe('ECR Proxy', () => {
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('RestAPI created', () => {
    // WHEN
    new CdkLib.ServerlessEcrProxy(stack, 'MyTestConstruct', {
      registryId: '12345678'
    });
    // THEN
    expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
  });

  test('RestAPI Stage', () => {
    // WHEN
    new CdkLib.ServerlessEcrProxy(stack, 'MyTestConstruct', {
      registryId: '12345678'
    });
    // THEN
    expect(stack).toHaveResource('AWS::ApiGateway::Stage', {
      "RestApiId": {
        "Ref": "MyTestConstructecrproxy1234567851BAB5FE"
      },
      "DeploymentId": {
        "Ref": "MyTestConstructecrproxy12345678DeploymentC216EA4Bea02409f908633ae0d57b707f65d6281"
      },
      'StageName': 'v2',
    });
  });

  test('RestAPI Access Log', () => {
    const logGroup = new LogGroup(stack, 'my-log-group');
    // WHEN
    new CdkLib.ServerlessEcrProxy(stack, 'MyTestConstruct', {
      registryId: '12345678',
      logGroup,
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::ApiGateway::Stage', {
      "AccessLogSetting": {
        "DestinationArn": {
          "Fn::GetAtt": [
            "myloggroupB3C64303",
            "Arn"
          ]
        },
        "Format": "$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] \"$context.httpMethod $context.resourcePath $context.protocol\" $context.status $context.responseLength $context.requestId"
      },
    });
  });

  test('EcrProxy Output', () => {
    // WHEN
    new CdkLib.ServerlessEcrProxy(stack, 'MyTestConstruct', {
      registryId: '12345678'
    });
    // THEN
    expect(stack).toHaveOutput({
      exportName: `${stack.stackName}-RegistryEndpoint-12345678`,
      outputValue: {
        "Fn::Join": [
          "",
          [
            {
              "Ref": "MyTestConstructecrproxy1234567851BAB5FE"
            },
            ".execute-api.",
            {
              "Ref": "AWS::Region"
            },
            ".",
            {
              "Ref": "AWS::URLSuffix"
            }
          ]
        ]
      },
    });
  });

  test('RestAPI default name', () => {
    // WHEN
    new CdkLib.ServerlessEcrProxy(stack, 'MyTestConstruct', {
      registryId: '12345678'
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::ApiGateway::RestApi', {
      'Name': 'ecr-proxy-12345678',
    });
  });

  test('RestAPI custom name', () => {
    // WHEN
    new CdkLib.ServerlessEcrProxy(stack, 'MyTestConstruct', {
      registryId: '12345678',
      name: 'my-ecr-proxy'
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::ApiGateway::RestApi', {
      'Name': 'my-ecr-proxy',
    });
  });

  test('HttpApi stage and name', () => {
    // WHEN
    new CdkLib.ServerlessEcrProxy(stack, 'MyTestConstruct', {
      registryId: '12345678',
      apiGatewayVersion: ApiGatewayVersion.HTTP_API,
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Api', {
      'Name': 'ecr-proxy-12345678',
    });
    expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Stage', {
      'StageName': 'v2',
    });
    expect(stack).toHaveOutput({
      exportName: `${stack.stackName}-RegistryEndpoint-12345678`,
      outputValue: {
        "Fn::Join": [
          "",
          [
            {
              "Ref": "MyTestConstructecrproxy1234567851BAB5FE"
            },
            ".execute-api.",
            {
              "Ref": "AWS::Region"
            },
            ".",
            {
              "Ref": "AWS::URLSuffix"
            }
          ]
        ]
      },
    });
  });
});


