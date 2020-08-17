#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessEcrProxy, ApiGatewayVersion } from 'serverless-ecr-proxy';

const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const registryId = app.node.tryGetContext('registry_id') || env.account;
const stack = new cdk.Stack(app, `ServerlessEcrProxy-${registryId}`, { env })
/**
 * create the ecr proxy service
 */
new ServerlessEcrProxy(stack, 'Service', {
    registryId,
    apiGatewayVersion: ApiGatewayVersion.HTTP_API,
});

