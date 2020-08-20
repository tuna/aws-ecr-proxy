"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
const aws_apigatewayv2_1 = require("@aws-cdk/aws-apigatewayv2");
const apigateway = require("@aws-cdk/aws-apigateway");
const path = require("path");
const iam = require("@aws-cdk/aws-iam");
const aws_apigateway_1 = require("@aws-cdk/aws-apigateway");
var ApiGatewayVersion;
(function (ApiGatewayVersion) {
    ApiGatewayVersion[ApiGatewayVersion["REST_API"] = 0] = "REST_API";
    ApiGatewayVersion[ApiGatewayVersion["HTTP_API"] = 1] = "HTTP_API";
})(ApiGatewayVersion = exports.ApiGatewayVersion || (exports.ApiGatewayVersion = {}));
class ApigatewayHttpApi extends cdk.Resource {
    constructor(scope, id, props) {
        super(scope, id);
        const api = new aws_apigatewayv2_1.HttpApi(scope, props.name, {
            defaultIntegration: new aws_apigatewayv2_1.LambdaProxyIntegration({
                handler: props.handler,
                payloadFormatVersion: aws_apigatewayv2_1.PayloadFormatVersion.VERSION_1_0,
            }),
            createDefaultStage: false,
        });
        api.addStage('StageV2', {
            autoDeploy: true,
            stageName: 'v2'
        });
        this.endpoint = `${api.httpApiId}.execute-api.${cdk.Stack.of(this).region}.${cdk.Stack.of(this).urlSuffix}`;
        this.api = api;
    }
}
exports.ApigatewayHttpApi = ApigatewayHttpApi;
class ApigatewayRestApi extends cdk.Resource {
    constructor(scope, id, props) {
        var _a;
        super(scope, id);
        this.api = new apigateway.LambdaRestApi(scope, props.name, {
            handler: props.handler,
            endpointConfiguration: {
                types: [apigateway.EndpointType.REGIONAL]
            },
            deployOptions: {
                stageName: 'v2',
                accessLogDestination: props.logGroup ?
                    new aws_apigateway_1.LogGroupLogDestination(props.logGroup) : undefined,
            },
            domainName: (_a = props) === null || _a === void 0 ? void 0 : _a.domain,
        });
        this.endpoint = `${this.api.restApiId}.execute-api.${cdk.Stack.of(this).region}.${cdk.Stack.of(this).urlSuffix}`;
    }
}
exports.ApigatewayRestApi = ApigatewayRestApi;
class ServerlessEcrProxy extends cdk.Resource {
    constructor(scope, id, props) {
        var _a;
        super(scope, id);
        const handler = new lambda.Function(this, `LambdaFn-${props.registryId}`, {
            code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda.d')),
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.handler',
            environment: {
                registry_id: props.registryId
            }
        });
        handler.role.addToPolicy(new iam.PolicyStatement({
            actions: [
                'ecr:GetDownloadUrlForLayer',
                'ecr:BatchGetImage',
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability"
            ],
            resources: ['*']
        }));
        const apiProps = {
            handler,
            name: props.name ? props.name : `ecr-proxy-${props.registryId}`,
            domain: (_a = props) === null || _a === void 0 ? void 0 : _a.domain,
            logGroup: props.logGroup,
        };
        if (props.apiGatewayVersion === ApiGatewayVersion.HTTP_API) {
            const httpApi = new ApigatewayHttpApi(this, `HttpApi-${props.registryId}`, apiProps);
            this.ecrProxy = httpApi;
        }
        else {
            const restApi = new ApigatewayRestApi(this, `RestApi-${props.registryId}`, apiProps);
            this.ecrProxy = restApi;
        }
        new cdk.CfnOutput(scope, `ProxyURL-${props.registryId}`, {
            value: this.ecrProxy.endpoint,
            exportName: `${cdk.Stack.of(this).stackName}-RegistryEndpoint-${props.registryId}`,
        });
    }
}
exports.ServerlessEcrProxy = ServerlessEcrProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNyLXByb3h5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWNyLXByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXFDO0FBQ3JDLDhDQUE4QztBQUM5QyxnRUFBNEc7QUFFNUcsc0RBQXNEO0FBQ3RELDZCQUE2QjtBQUM3Qix3Q0FBd0M7QUFFeEMsNERBQWlFO0FBRWpFLElBQVksaUJBR1g7QUFIRCxXQUFZLGlCQUFpQjtJQUMzQixpRUFBUSxDQUFBO0lBQ1IsaUVBQVEsQ0FBQTtBQUNWLENBQUMsRUFIVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUc1QjtBQXdDRCxNQUFhLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxRQUFRO0lBTWpELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBZTtRQUMzRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLElBQUksMEJBQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRTtZQUN6QyxrQkFBa0IsRUFBRSxJQUFJLHlDQUFzQixDQUFDO2dCQUM3QyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3RCLG9CQUFvQixFQUFFLHVDQUFvQixDQUFDLFdBQVc7YUFDdkQsQ0FBQztZQUNGLGtCQUFrQixFQUFFLEtBQUs7U0FDMUIsQ0FBQyxDQUFBO1FBRUYsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUU7WUFDdEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLGdCQUFnQixHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxF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TSxPQUFPLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDcEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7U0FDeEI7UUFFRCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFlBQVksS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3ZELEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVE7WUFDN0IsVUFBVSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxxQkFBcUIsS0FBSyxDQUFDLFVBQVUsRUFBRTtTQUNuRixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0Y7QUE1Q0QsZ0RBNENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgSUh0dHBBcGksIEh0dHBBcGksIExhbWJkYVByb3h5SW50ZWdyYXRpb24sIFBheWxvYWRGb3JtYXRWZXJzaW9uIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXl2Mic7XG5pbXBvcnQgeyBMb2dHcm91cCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1sb2dzJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgTG9nR3JvdXBMb2dEZXN0aW5hdGlvbiB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1hcGlnYXRld2F5JztcblxuZXhwb3J0IGVudW0gQXBpR2F0ZXdheVZlcnNpb24ge1xuICBSRVNUX0FQSSxcbiAgSFRUUF9BUEksXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVybGVzc0VjclByb3h5UHJvcHMge1xuICAvKipcbiAgICogcmVnaXN0cnkgaWQgZm9yIEFtYXpvbiBFQ1IgdG8gYmUgcHJveGllZFxuICAgKi9cbiAgcmVhZG9ubHkgcmVnaXN0cnlJZDogc3RyaW5nXG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiBBUEkgR2F0ZXdheVxuICAgKiBcbiAgICogQGRlZmF1bHQgYGVjci1wcm94eS0ke3JlZ2lzdHJ5SWR9YFxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZT86IHN0cmluZ1xuICAvKipcbiAgICogUm91dGUgNTMgaG9zdGVkIHpvbmUgSUQgZm9yIGN1c3RvbSBkb21haW4gbmFtZVxuICAgKi9cbiAgcmVhZG9ubHkgem9uZT86IHJvdXRlNTMuSUhvc3RlZFpvbmVcbiAgLyoqXG4gICAqIEFQSSBHYXRld2F5IEFQSSBSRVNUIEFQSSBvciBIVFRQIEFQSVxuICAgKiBcbiAgICogQGRlZmF1bHQgUkVTVF9BUElcbiAgICovXG4gIHJlYWRvbmx5IGFwaUdhdGV3YXlWZXJzaW9uPzogQXBpR2F0ZXdheVZlcnNpb25cbiAgLyoqXG4gICAqIFRoZSBDbG91ZFdhdGNoIGxvZyBncm91cCBmb3IgYWNjZXNzIGxvZ1xuICAgKi9cbiAgcmVhZG9ubHkgbG9nR3JvdXA/OiBMb2dHcm91cCBcbiAgIC8qKlxuICAgICogQVBJIEdhdGV3YXkgZG9tYWluIG5hbWUgb3B0aW9ucyBmb3IgY3VzdG9tIGRvbWFpblxuICAgICovXG4gICByZWFkb25seSBkb21haW4/OiBhcGlnYXRld2F5LkRvbWFpbk5hbWVPcHRpb25zXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUVDUlByb3h5IHtcbiAgLyoqXG4gICAqIEVuZHBvaW50IG9mIEVDUiBwcm94eS5cbiAgICovXG4gIHJlYWRvbmx5IGVuZHBvaW50OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBBcGlnYXRld2F5SHR0cEFwaSBleHRlbmRzIGNkay5SZXNvdXJjZSBpbXBsZW1lbnRzIElFQ1JQcm94eSB7XG5cbiAgLy8gZm9yIEFQSSBHYXRld2F5IEhUVFAgQVBJKHYyKVxuICByZWFkb25seSBhcGk6IElIdHRwQXBpO1xuICByZWFkb25seSBlbmRwb2ludDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQXBpUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpXG4gICAgY29uc3QgYXBpID0gbmV3IEh0dHBBcGkoc2NvcGUsIHByb3BzLm5hbWUsIHtcbiAgICAgIGRlZmF1bHRJbnRlZ3JhdGlvbjogbmV3IExhbWJkYVByb3h5SW50ZWdyYXRpb24oe1xuICAgICAgICBoYW5kbGVyOiBwcm9wcy5oYW5kbGVyLFxuICAgICAgICBwYXlsb2FkRm9ybWF0VmVyc2lvbjogUGF5bG9hZEZvcm1hdFZlcnNpb24uVkVSU0lPTl8xXzAsXG4gICAgICB9KSxcbiAgICAgIGNyZWF0ZURlZmF1bHRTdGFnZTogZmFsc2UsXG4gICAgfSlcblxuICAgIGFwaS5hZGRTdGFnZSgnU3RhZ2VWMicsIHtcbiAgICAgIGF1dG9EZXBsb3k6IHRydWUsXG4gICAgICBzdGFnZU5hbWU6ICd2MidcbiAgICB9KVxuXG4gICAgdGhpcy5lbmRwb2ludCA9IGAke2FwaS5odHRwQXBpSWR9LmV4ZWN1dGUtYXBpLiR7Y2RrLlN0YWNrLm9mKHRoaXMpLnJlZ2lvbn0uJHtjZGsuU3RhY2sub2YodGhpcykudXJsU3VmZml4fWA7XG4gICAgdGhpcy5hcGkgPSBhcGk7XG4gIH1cbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIEFwaVByb3BzIHtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICByZWFkb25seSBoYW5kbGVyOiBsYW1iZGEuSUZ1bmN0aW9uLFxuICByZWFkb25seSBkb21haW4/OiBhcGlnYXRld2F5LkRvbWFpbk5hbWVPcHRpb25zLFxuICByZWFkb25seSBsb2dHcm91cD86IExvZ0dyb3VwLFxufVxuXG5leHBvcnQgY2xhc3MgQXBpZ2F0ZXdheVJlc3RBcGkgZXh0ZW5kcyBjZGsuUmVzb3VyY2UgaW1wbGVtZW50cyBJRUNSUHJveHkge1xuICAvLyBmb3IgQVBJIEdhdGV3YXkgUkVTVCBBUEkodjEpXG4gIHJlYWRvbmx5IGFwaTogYXBpZ2F0ZXdheS5SZXN0QXBpO1xuICByZWFkb25seSBlbmRwb2ludDogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgIHByb3BzOiBBcGlQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZClcblxuICAgIHRoaXMuYXBpID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhUmVzdEFwaShzY29wZSwgcHJvcHMubmFtZSwge1xuICAgICAgaGFuZGxlcjogcHJvcHMuaGFuZGxlcixcbiAgICAgIGVuZHBvaW50Q29uZmlndXJhdGlvbjoge1xuICAgICAgICB0eXBlczogW2FwaWdhdGV3YXkuRW5kcG9pbnRUeXBlLlJFR0lPTkFMXVxuICAgICAgfSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAndjInLFxuICAgICAgICBhY2Nlc3NMb2dEZXN0aW5hdGlvbjogcHJvcHMubG9nR3JvdXAgPyBcbiAgICAgICAgICBuZXcgTG9nR3JvdXBMb2dEZXN0aW5hdGlvbihwcm9wcy5sb2dHcm91cCkgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgICAgZG9tYWluTmFtZTogcHJvcHM/LmRvbWFpbixcbiAgICB9KVxuXG4gICAgdGhpcy5lbmRwb2ludCA9ICBgJHt0aGlzLmFwaS5yZXN0QXBpSWR9LmV4ZWN1dGUtYXBpLiR7Y2RrLlN0YWNrLm9mKHRoaXMpLnJlZ2lvbn0uJHtjZGsuU3RhY2sub2YodGhpcykudXJsU3VmZml4fWA7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlcnZlcmxlc3NFY3JQcm94eSBleHRlbmRzIGNkay5SZXNvdXJjZXtcbiAgcmVhZG9ubHkgZWNyUHJveHk6IElFQ1JQcm94eVxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFNlcnZlcmxlc3NFY3JQcm94eVByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIGBMYW1iZGFGbi0ke3Byb3BzLnJlZ2lzdHJ5SWR9YCwge1xuICAgICAgY29kZTogbGFtYmRhLkFzc2V0Q29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYS5kJykpLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEyX1gsXG4gICAgICBoYW5kbGVyOiAnbGFtYmRhLmhhbmRsZXInLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgcmVnaXN0cnlfaWQ6IHByb3BzLnJlZ2lzdHJ5SWRcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaGFuZGxlci5yb2xlIS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdlY3I6R2V0RG93bmxvYWRVcmxGb3JMYXllcicsXG4gICAgICAgICdlY3I6QmF0Y2hHZXRJbWFnZScsXG4gICAgICAgIFwiZWNyOkdldEF1dGhvcml6YXRpb25Ub2tlblwiLFxuICAgICAgICBcImVjcjpCYXRjaENoZWNrTGF5ZXJBdmFpbGFiaWxpdHlcIlxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWyAnKicgXVxuICAgIH0pKVxuXG4gICAgY29uc3QgYXBpUHJvcHMgPSB7XG4gICAgICBoYW5kbGVyLFxuICAgICAgbmFtZTogcHJvcHMubmFtZSA/IHByb3BzLm5hbWUgOiBgZWNyLXByb3h5LSR7cHJvcHMucmVnaXN0cnlJZH1gLFxuICAgICAgZG9tYWluOiBwcm9wcz8uZG9tYWluLFxuICAgICAgbG9nR3JvdXA6IHByb3BzLmxvZ0dyb3VwLFxuICAgIH07XG5cbiAgICBpZiAocHJvcHMuYXBpR2F0ZXdheVZlcnNpb24gPT09IEFwaUdhdGV3YXlWZXJzaW9uLkhUVFBfQVBJKSB7XG4gICAgICBjb25zdCBodHRwQXBpID0gbmV3IEFwaWdhdGV3YXlIdHRwQXBpKHRoaXMsIGBIdHRwQXBpLSR7cHJvcHMucmVnaXN0cnlJZH1gLCBhcGlQcm9wcylcbiAgICAgIHRoaXMuZWNyUHJveHkgPSBodHRwQXBpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlc3RBcGkgPSBuZXcgQXBpZ2F0ZXdheVJlc3RBcGkodGhpcywgYFJlc3RBcGktJHtwcm9wcy5yZWdpc3RyeUlkfWAsIGFwaVByb3BzKVxuICAgICAgdGhpcy5lY3JQcm94eSA9IHJlc3RBcGlcbiAgICB9XG4gICAgXG4gICAgbmV3IGNkay5DZm5PdXRwdXQoc2NvcGUsIGBQcm94eVVSTC0ke3Byb3BzLnJlZ2lzdHJ5SWR9YCwgeyBcbiAgICAgIHZhbHVlOiB0aGlzLmVjclByb3h5LmVuZHBvaW50LFxuICAgICAgZXhwb3J0TmFtZTogYCR7Y2RrLlN0YWNrLm9mKHRoaXMpLnN0YWNrTmFtZX0tUmVnaXN0cnlFbmRwb2ludC0ke3Byb3BzLnJlZ2lzdHJ5SWR9YCwgXG4gICAgfSlcbiAgfVxufVxuIl19