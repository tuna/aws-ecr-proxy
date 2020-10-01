# AWS ECR Proxy

**AWS ECR Proxy** is a CDK construct library based on [monken/aws-ecr-public](https://github.com/monken/aws-ecr-public).

![diagram](docs/aws-ecr-public.svg)

## Usage

First, setup a CDK stack with the construct:

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

The registry id usually refers to your account id, and corresponding ECR hostname should be `${registryId}.dkr.ecr.${region}.amazonaws.com`.

After deployment, the stack outputs a url like `aabbccdd1234.execute-api.${region}.amazonaws.com`. If you have an image at `${registryId}.dkr.ecr.${region}.amazonaws.com/repo:tag`, you can pull it without authentication at `aabbccdd1234.execute-api.${region}.amazonaws.com/repo:tag`:

```shell
# Push to ECR on one computer
$ docker tag repo:tag ${registryId}.dkr.ecr.${region}.amazonaws.com/repo:tag
$ docker push ${registryId}.dkr.ecr.${region}.amazonaws.com/repo:tag
# Pull from another computer
$ docker pull aabbccdd1234.execute-api.${region}.amazonaws.com/repo:tag
```
