# AWS ECR Proxy

**AWS ECR Proxy** is a CDK construct library based on [monken/aws-ecr-public](https://github.com/monken/aws-ecr-public).

![diagram](docs/aws-ecr-public.svg)


## Usage

```ts
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
```