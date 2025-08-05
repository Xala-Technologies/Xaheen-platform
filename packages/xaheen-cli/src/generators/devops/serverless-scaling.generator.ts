import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import { z } from "zod";
import { BaseGenerator } from "../base.generator";

// Serverless scaling configuration schema
const ServerlessScalingOptionsSchema = z.object({
	projectName: z.string(),
	projectPath: z.string(),
	provider: z
		.enum([
			"aws-lambda",
			"azure-functions",
			"gcp-functions",
			"vercel",
			"netlify",
			"cloudflare",
		])
		.default("aws-lambda"),
	functions: z.array(
		z.object({
			name: z.string(),
			type: z.enum(["api", "webhook", "scheduled", "stream", "queue"]),
			runtime: z
				.enum([
					"nodejs18",
					"nodejs20",
					"python3.11",
					"go1.21",
					"java17",
					"dotnet6",
				])
				.default("nodejs18"),
			memory: z.number().min(128).max(10240).default(1024),
			timeout: z.number().min(1).max(900).default(30),
			environment: z.record(z.string()).optional(),
			triggers: z.array(
				z.union([
					z.object({
						type: z.literal("http"),
						path: z.string(),
						methods: z.array(
							z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]),
						),
						cors: z.boolean().default(true),
					}),
					z.object({
						type: z.literal("schedule"),
						expression: z.string(), // Cron or rate expression
					}),
					z.object({
						type: z.literal("queue"),
						queueName: z.string(),
						batchSize: z.number().default(10),
					}),
					z.object({
						type: z.literal("stream"),
						streamArn: z.string(),
						startingPosition: z
							.enum(["TRIM_HORIZON", "LATEST"])
							.default("LATEST"),
					}),
					z.object({
						type: z.literal("storage"),
						bucket: z.string(),
						events: z.array(z.string()),
					}),
				]),
			),
			scaling: z
				.object({
					minConcurrency: z.number().min(0).default(0),
					maxConcurrency: z.number().min(1).default(1000),
					reservedConcurrency: z.number().optional(),
					provisionedConcurrency: z.number().optional(),
					targetUtilization: z.number().min(0.1).max(1).default(0.7),
				})
				.optional(),
			coldStart: z
				.object({
					optimization: z.boolean().default(true),
					warmupSchedule: z.string().optional(), // Cron expression for warmup
					keepWarmCount: z.number().min(0).default(0),
				})
				.optional(),
		}),
	),
	edgeLocations: z
		.array(
			z.enum([
				"us-east-1",
				"us-west-2",
				"eu-west-1",
				"eu-central-1",
				"ap-southeast-1",
				"ap-northeast-1",
				"global",
			]),
		)
		.optional(),
	monitoring: z
		.object({
			enabled: z.boolean().default(true),
			provider: z
				.enum(["cloudwatch", "datadog", "newrelic", "stackdriver"])
				.optional(),
			customMetrics: z.boolean().default(false),
			tracing: z.boolean().default(true),
			profiling: z.boolean().default(false),
		})
		.optional(),
	deployment: z
		.object({
			strategy: z
				.enum(["all-at-once", "canary", "linear", "blue-green"])
				.default("canary"),
			canarySettings: z
				.object({
					percentage: z.number().min(1).max(50).default(10),
					duration: z.string().default("5m"),
				})
				.optional(),
			rollbackOnFailure: z.boolean().default(true),
		})
		.optional(),
	costOptimization: z
		.object({
			enabled: z.boolean().default(true),
			spotPricing: z.boolean().default(false),
			computeSavingsPlan: z.boolean().default(false),
			idleTimeout: z.number().min(0).default(300), // seconds
		})
		.optional(),
});

export type ServerlessScalingOptions = z.infer<
	typeof ServerlessScalingOptionsSchema
>;

interface ServerlessConfig {
	name: string;
	content: string;
	path: string;
}

export class ServerlessScalingGenerator extends BaseGenerator {
	async generate(options: ServerlessScalingOptions): Promise<void> {
		try {
			// Validate options
			const validatedOptions = ServerlessScalingOptionsSchema.parse(options);

			console.log(
				chalk.blue("⚡ Generating Serverless Scaling Configuration..."),
			);

			// Generate configurations based on provider
			const configs = await this.generateConfigurations(validatedOptions);

			// Write configurations to filesystem
			await this.writeConfigurations(configs, validatedOptions.projectPath);

			// Generate monitoring configuration
			if (validatedOptions.monitoring?.enabled) {
				await this.generateMonitoringConfig(validatedOptions);
			}

			// Generate deployment scripts
			await this.generateDeploymentScripts(validatedOptions);

			// Generate cost optimization configuration
			if (validatedOptions.costOptimization?.enabled) {
				await this.generateCostOptimizationConfig(validatedOptions);
			}

			console.log(
				chalk.green(
					"✅ Serverless scaling configuration generated successfully!",
				),
			);
		} catch (error) {
			console.error(
				chalk.red("❌ Error generating serverless scaling configuration:"),
				error,
			);
			throw error;
		}
	}

	private async generateConfigurations(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		switch (options.provider) {
			case "aws-lambda":
				configs.push(...(await this.generateAWSLambdaConfig(options)));
				break;
			case "azure-functions":
				configs.push(...(await this.generateAzureFunctionsConfig(options)));
				break;
			case "gcp-functions":
				configs.push(...(await this.generateGCPFunctionsConfig(options)));
				break;
			case "vercel":
				configs.push(...(await this.generateVercelConfig(options)));
				break;
			case "netlify":
				configs.push(...(await this.generateNetlifyConfig(options)));
				break;
			case "cloudflare":
				configs.push(...(await this.generateCloudflareConfig(options)));
				break;
		}

		// Generate common configuration files
		configs.push(...(await this.generateCommonConfigs(options)));

		return configs;
	}

	private async generateAWSLambdaConfig(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		// Generate SAM template
		configs.push({
			name: "template.yaml",
			content: this.generateSAMTemplate(options),
			path: "template.yaml",
		});

		// Generate serverless.yml for Serverless Framework
		configs.push({
			name: "serverless.yml",
			content: this.generateServerlessFrameworkConfig(options),
			path: "serverless.yml",
		});

		// Generate CDK stack
		configs.push({
			name: "lambda-stack.ts",
			content: this.generateCDKStack(options),
			path: "lib/lambda-stack.ts",
		});

		// Generate Lambda layer configuration
		configs.push({
			name: "layers.json",
			content: JSON.stringify(this.generateLambdaLayers(options), null, 2),
			path: "layers/layers.json",
		});

		return configs;
	}

	private generateSAMTemplate(options: ServerlessScalingOptions): string {
		const globals = `Globals:
  Function:
    Timeout: ${Math.max(...options.functions.map((f) => f.timeout))}
    MemorySize: ${Math.max(...options.functions.map((f) => f.memory))}
    Runtime: ${options.functions[0]?.runtime || "nodejs18.x"}
    Tracing: Active
    Environment:
      Variables:
        PROJECT_NAME: ${options.projectName}
        STAGE: !Ref Stage
    Tags:
      Project: ${options.projectName}
      ManagedBy: xaheen-cli`;

		const functions = options.functions
			.map((func) => {
				const triggers = func.triggers
					.map((trigger) => {
						switch (trigger.type) {
							case "http":
								return `        HttpApi:
          Type: HttpApi
          Properties:
            Path: ${trigger.path}
            Method: ${trigger.methods?.[0] || "ANY"}${
							trigger.cors
								? `
            CorsConfiguration:
              AllowOrigins:
                - "*"
              AllowMethods:
                - "*"
              AllowHeaders:
                - "*"`
								: ""
						}`;
							case "schedule":
								return `        Schedule:
          Type: Schedule
          Properties:
            Schedule: ${trigger.expression}
            Enabled: true`;
							case "queue":
								return `        SQS:
          Type: SQS
          Properties:
            Queue: !GetAtt ${trigger.queueName}Queue.Arn
            BatchSize: ${trigger.batchSize}`;
							case "stream":
								return `        Kinesis:
          Type: Kinesis
          Properties:
            Stream: ${trigger.streamArn}
            StartingPosition: ${trigger.startingPosition}
            BatchSize: 10`;
							case "storage":
								return `        S3:
          Type: S3
          Properties:
            Bucket: !Ref ${trigger.bucket}Bucket
            Events: ${JSON.stringify(trigger.events)}`;
							default:
								return "";
						}
					})
					.filter(Boolean)
					.join("\n");

				return `  ${func.name}Function:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: ${options.projectName}-${func.name}
      Handler: src/handlers/${func.name}.handler
      Runtime: ${func.runtime}.x
      MemorySize: ${func.memory}
      Timeout: ${func.timeout}${
				func.scaling?.reservedConcurrency
					? `
      ReservedConcurrentExecutions: ${func.scaling.reservedConcurrency}`
					: ""
			}${
				func.scaling?.provisionedConcurrency
					? `
      ProvisionedConcurrencyConfig:
        ProvisionedConcurrentExecutions: ${func.scaling.provisionedConcurrency}`
					: ""
			}${
				func.environment && Object.keys(func.environment).length > 0
					? `
      Environment:
        Variables:${Object.entries(func.environment)
					.map(
						([key, value]) => `
          ${key}: ${value}`,
					)
					.join("")}`
					: ""
			}
      Events:
${triggers}${
	options.deployment?.strategy === "canary"
		? `
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent5Minutes
        Alarms:
          - !Ref ${func.name}ErrorsAlarm
        TriggerConfigurations:
          - TriggerEvents:
              - DeploymentStart
              - DeploymentSuccess
              - DeploymentFailure
              - DeploymentStop
              - DeploymentRollback
            TriggerName: ${func.name}DeploymentTrigger
            TriggerTargetArn: !Ref DeploymentNotificationTopic`
		: ""
}

  ${func.name}ErrorsAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ${options.projectName}-${func.name}-errors
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 60
      EvaluationPeriods: 2
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: FunctionName
          Value: !Ref ${func.name}Function`;
			})
			.join("\n\n");

		return `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Description: ${options.projectName} Serverless Application

Parameters:
  Stage:
    Type: String
    Default: dev
    AllowedValues:
      - dev
      - staging
      - production

${globals}

Resources:
${functions}

  DeploymentNotificationTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: ${options.projectName}-deployment-notifications
      DisplayName: Deployment Notifications

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://\${ServerlessHttpApi}.execute-api.\${AWS::Region}.amazonaws.com'
    Export:
      Name: !Sub '\${AWS::StackName}-ApiEndpoint'
`;
	}

	private generateServerlessFrameworkConfig(
		options: ServerlessScalingOptions,
	): string {
		const functions: Record<string, any> = {};

		options.functions.forEach((func) => {
			const events = func.triggers
				.map((trigger) => {
					switch (trigger.type) {
						case "http":
							return {
								httpApi: {
									path: trigger.path,
									method: trigger.methods?.[0] || "ANY",
									cors: trigger.cors,
								},
							};
						case "schedule":
							return {
								schedule: {
									rate: trigger.expression,
									enabled: true,
								},
							};
						case "queue":
							return {
								sqs: {
									arn: `\${cf:${options.projectName}-resources.${trigger.queueName}QueueArn}`,
									batchSize: trigger.batchSize,
								},
							};
						case "stream":
							return {
								stream: {
									arn: trigger.streamArn,
									startingPosition: trigger.startingPosition,
								},
							};
						case "storage":
							return {
								s3: {
									bucket: trigger.bucket,
									events: trigger.events,
								},
							};
						default:
							return null;
					}
				})
				.filter(Boolean);

			functions[func.name] = {
				handler: `src/handlers/${func.name}.handler`,
				runtime: func.runtime,
				memorySize: func.memory,
				timeout: func.timeout,
				reservedConcurrency: func.scaling?.reservedConcurrency,
				provisionedConcurrency: func.scaling?.provisionedConcurrency,
				environment: func.environment,
				events,
			};

			// Add warmup configuration for cold start optimization
			if (func.coldStart?.optimization && func.coldStart?.keepWarmCount > 0) {
				functions[`${func.name}Warmer`] = {
					handler: "src/handlers/warmer.handler",
					events: [
						{
							schedule: {
								rate: func.coldStart.warmupSchedule || "rate(5 minutes)",
								input: {
									functionName: func.name,
									concurrentExecutions: func.coldStart.keepWarmCount,
								},
							},
						},
					],
				};
			}
		});

		return `service: ${options.projectName}

frameworkVersion: '3'

provider:
  name: aws
  runtime: ${options.functions[0]?.runtime || "nodejs18.x"}
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-1'}
  
  tracing:
    lambda: true
    apiGateway: true

  logs:
    httpApi:
      format: '{ "requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod", "routeKey":"$context.routeKey", "status":"$context.status", "protocol":"$context.protocol", "responseLength":"$context.responseLength" }'

  environment:
    STAGE: \${self:provider.stage}
    REGION: \${self:provider.region}
    PROJECT_NAME: ${options.projectName}

  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - xray:PutTraceSegments
            - xray:PutTelemetryRecords
          Resource: "*"
        - Effect: Allow
          Action:
            - logs:CreateLogGroup
            - logs:CreateLogStream
            - logs:PutLogEvents
          Resource: "*"${
						options.monitoring?.customMetrics
							? `
        - Effect: Allow
          Action:
            - cloudwatch:PutMetricData
          Resource: "*"`
							: ""
					}

plugins:
  - serverless-plugin-tracing
  - serverless-plugin-canary-deployments
  - serverless-prune-plugin
  - serverless-plugin-aws-alerts${
		options.functions.some((f) => f.coldStart?.optimization)
			? `
  - serverless-plugin-warmup`
			: ""
	}

custom:
  prune:
    automatic: true
    number: 3
  
  alerts:
    stages:
      - production
      - staging
    topics:
      alarm:
        topic: \${self:service}-\${self:provider.stage}-alerts
        notifications:
          - protocol: email
            endpoint: \${env:ALERT_EMAIL}
    alarms:
      - functionThrottles
      - functionErrors
      - functionDuration
      - functionConcurrentExecutions${
				options.deployment?.strategy === "canary"
					? `
  
  canarySettings:
    percentage: ${options.deployment.canarySettings?.percentage || 10}
    duration: ${options.deployment.canarySettings?.duration || "5m"}
    rollbackOnFailure: ${options.deployment.rollbackOnFailure}`
					: ""
			}${
				options.functions.some((f) => f.coldStart?.optimization)
					? `
  
  warmup:
    default:
      enabled: true
      folderName: '.warmup'
      cleanFolder: false
      memorySize: 256
      events:
        - schedule: 'rate(5 minutes)'
      timeout: 20
      prewarm: true
      concurrency: ${Math.max(...options.functions.map((f) => f.coldStart?.keepWarmCount || 0))}`
					: ""
			}

functions:
${Object.entries(functions)
	.map(
		([name, config]) => `  ${name}:
    handler: ${config.handler}
    runtime: ${config.runtime}
    memorySize: ${config.memorySize}
    timeout: ${config.timeout}${
			config.reservedConcurrency
				? `
    reservedConcurrency: ${config.reservedConcurrency}`
				: ""
		}${
			config.provisionedConcurrency
				? `
    provisionedConcurrency: ${config.provisionedConcurrency}`
				: ""
		}${
			config.environment && Object.keys(config.environment).length > 0
				? `
    environment:${Object.entries(config.environment)
			.map(
				([key, value]) => `
      ${key}: ${value}`,
			)
			.join("")}`
				: ""
		}
    events:${config.events
			.map(
				(event: any) => `
      - ${Object.keys(event)[0]}:${JSON.stringify(
				Object.values(event)[0],
				null,
				10,
			)
				.split("\n")
				.map((line, i) => (i === 0 ? line : `          ${line}`))
				.join("\n")
				.slice(0, -1)}`,
			)
			.join("")}`,
	)
	.join("\n")}

resources:
  Resources:
    # Add any additional resources here (SQS queues, S3 buckets, etc.)
    
  Outputs:
    ServiceEndpoint:
      Description: URL of the service endpoint
      Value:
        Fn::Join:
          - ''
          - - 'https://'
            - Ref: HttpApi
            - '.execute-api.'
            - Ref: AWS::Region
            - '.amazonaws.com'
`;
	}

	private generateCDKStack(options: ServerlessScalingOptions): string {
		return `import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

export interface LambdaStackProps extends cdk.StackProps {
  projectName: string;
  stage: string;
}

export class LambdaStack extends cdk.Stack {
  public readonly api: apigateway.HttpApi;
  private readonly functions: Map<string, lambda.Function> = new Map();

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Create HTTP API
    this.api = new apigateway.HttpApi(this, 'HttpApi', {
      apiName: \`\${props.projectName}-api\`,
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ['*'],
      },
    });

    // Create Lambda functions
${options.functions
	.map(
		(func) => `    this.createFunction('${func.name}', {
      runtime: lambda.Runtime.${this.getCDKRuntime(func.runtime)},
      memorySize: ${func.memory},
      timeout: cdk.Duration.seconds(${func.timeout}),
      environment: ${JSON.stringify(func.environment || {})},
      reservedConcurrentExecutions: ${func.scaling?.reservedConcurrency || "undefined"},
      provisionedConcurrentExecutions: ${func.scaling?.provisionedConcurrency || "undefined"},
      triggers: ${JSON.stringify(func.triggers)},
    }, props);
`,
	)
	.join("\n")}

    // Set up monitoring
    this.setupMonitoring(props);

    // Set up auto-scaling
    this.setupAutoScaling(props);

    // Output API endpoint
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url!,
      description: 'API Gateway endpoint URL',
      exportName: \`\${props.projectName}-api-endpoint\`,
    });
  }

  private createFunction(
    name: string,
    config: any,
    props: LambdaStackProps
  ): lambda.Function {
    const func = new lambda.Function(this, \`\${name}Function\`, {
      functionName: \`\${props.projectName}-\${name}\`,
      runtime: config.runtime,
      handler: \`src/handlers/\${name}.handler\`,
      code: lambda.Code.fromAsset('dist'),
      memorySize: config.memorySize,
      timeout: config.timeout,
      environment: {
        ...config.environment,
        PROJECT_NAME: props.projectName,
        STAGE: props.stage,
      },
      reservedConcurrentExecutions: config.reservedConcurrentExecutions,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Set up provisioned concurrency if specified
    if (config.provisionedConcurrentExecutions) {
      const alias = new lambda.Alias(this, \`\${name}Alias\`, {
        aliasName: 'live',
        version: func.currentVersion,
        provisionedConcurrentExecutions: config.provisionedConcurrentExecutions,
      });
    }

    // Set up triggers
    config.triggers.forEach((trigger: any) => {
      switch (trigger.type) {
        case 'http':
          const integration = new apigatewayIntegrations.HttpLambdaIntegration(
            \`\${name}Integration\`,
            func
          );
          this.api.addRoutes({
            path: trigger.path,
            methods: trigger.methods.map((m: string) => 
              apigateway.HttpMethod[m as keyof typeof apigateway.HttpMethod]
            ),
            integration,
          });
          break;
        
        case 'schedule':
          const rule = new events.Rule(this, \`\${name}Schedule\`, {
            schedule: events.Schedule.expression(trigger.expression),
          });
          rule.addTarget(new targets.LambdaFunction(func));
          break;
        
        case 'queue':
          const queue = new sqs.Queue(this, \`\${trigger.queueName}Queue\`);
          func.addEventSource(new lambdaEventSources.SqsEventSource(queue, {
            batchSize: trigger.batchSize,
          }));
          break;
        
        case 'storage':
          const bucket = s3.Bucket.fromBucketName(
            this,
            \`\${trigger.bucket}Bucket\`,
            trigger.bucket
          );
          trigger.events.forEach((event: string) => {
            bucket.addEventNotification(
              s3.EventType[event as keyof typeof s3.EventType],
              new s3n.LambdaDestination(func)
            );
          });
          break;
      }
    });

    this.functions.set(name, func);
    return func;
  }

  private setupMonitoring(props: LambdaStackProps): void {
    // Create CloudWatch dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: \`\${props.projectName}-serverless-dashboard\`,
    });

    this.functions.forEach((func, name) => {
      // Add metrics to dashboard
      dashboard.addWidgets(
        new cloudwatch.GraphWidget({
          title: \`\${name} Metrics\`,
          left: [
            func.metricInvocations(),
            func.metricErrors(),
            func.metricThrottles(),
          ],
          right: [func.metricDuration()],
        })
      );

      // Create alarms
      new cloudwatch.Alarm(this, \`\${name}ErrorAlarm\`, {
        metric: func.metricErrors(),
        threshold: 10,
        evaluationPeriods: 2,
        alarmDescription: \`Error alarm for \${name} function\`,
      });

      new cloudwatch.Alarm(this, \`\${name}ThrottleAlarm\`, {
        metric: func.metricThrottles(),
        threshold: 5,
        evaluationPeriods: 1,
        alarmDescription: \`Throttle alarm for \${name} function\`,
      });
    });
  }

  private setupAutoScaling(props: LambdaStackProps): void {
    // Auto-scaling is handled through provisioned concurrency
    // and reserved concurrent executions set on each function
  }

  private getCDKRuntime(runtime: string): string {
    const runtimeMap: Record<string, string> = {
      'nodejs18': 'NODEJS_18_X',
      'nodejs20': 'NODEJS_20_X',
      'python3.11': 'PYTHON_3_11',
      'go1.21': 'GO_1_X',
      'java17': 'JAVA_17',
      'dotnet6': 'DOTNET_6',
    };
    return runtimeMap[runtime] || 'NODEJS_18_X';
  }
}
`;
	}

	private generateLambdaLayers(options: ServerlessScalingOptions): any {
		return {
			layers: [
				{
					name: `${options.projectName}-common`,
					description: "Common dependencies and utilities",
					compatibleRuntimes: Array.from(
						new Set(options.functions.map((f) => f.runtime)),
					),
					content: {
						dependencies: {
							"aws-sdk": "latest",
							"aws-xray-sdk": "latest",
							axios: "latest",
							lodash: "latest",
						},
					},
				},
				{
					name: `${options.projectName}-monitoring`,
					description: "Monitoring and observability tools",
					compatibleRuntimes: Array.from(
						new Set(options.functions.map((f) => f.runtime)),
					),
					content: {
						dependencies: {
							"@opentelemetry/api": "latest",
							"@opentelemetry/sdk-node": "latest",
							winston: "latest",
							pino: "latest",
						},
					},
				},
			],
		};
	}

	private async generateAzureFunctionsConfig(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		// Generate host.json
		configs.push({
			name: "host.json",
			content: this.generateAzureHostJson(options),
			path: "host.json",
		});

		// Generate function.json for each function
		for (const func of options.functions) {
			configs.push({
				name: "function.json",
				content: this.generateAzureFunctionJson(func),
				path: `${func.name}/function.json`,
			});
		}

		// Generate ARM template
		configs.push({
			name: "azuredeploy.json",
			content: this.generateAzureARMTemplate(options),
			path: "azuredeploy.json",
		});

		return configs;
	}

	private generateAzureHostJson(options: ServerlessScalingOptions): string {
		return JSON.stringify(
			{
				version: "2.0",
				logging: {
					applicationInsights: {
						samplingSettings: {
							isEnabled: true,
							maxTelemetryItemsPerSecond: 20,
						},
					},
				},
				functionTimeout: `00:00:${Math.max(...options.functions.map((f) => f.timeout))}`,
				healthMonitor: {
					enabled: true,
					healthCheckInterval: "00:00:10",
					healthCheckWindow: "00:01:00",
					healthCheckThreshold: 3,
					counterThreshold: 0.8,
				},
				extensions: {
					http: {
						routePrefix: "api",
						maxOutstandingRequests: 200,
						maxConcurrentRequests: 100,
						dynamicThrottlesEnabled: true,
					},
				},
				concurrency: {
					dynamicConcurrencyEnabled: true,
					snapshotPersistenceEnabled: true,
				},
				retry: {
					strategy: "exponentialBackoff",
					maxRetryCount: 5,
					minimumInterval: "00:00:05",
					maximumInterval: "00:01:00",
				},
				singleton: {
					lockPeriod: "00:00:15",
					listenerLockPeriod: "00:01:00",
					listenerLockRecoveryPollingInterval: "00:01:00",
					lockAcquisitionTimeout: "00:01:00",
					lockAcquisitionPollingInterval: "00:00:03",
				},
			},
			null,
			2,
		);
	}

	private generateAzureFunctionJson(
		func: ServerlessScalingOptions["functions"][0],
	): string {
		const bindings = func.triggers
			.map((trigger) => {
				switch (trigger.type) {
					case "http":
						return {
							type: "httpTrigger",
							direction: "in",
							name: "req",
							methods: trigger.methods?.map((m) => m.toLowerCase()),
							route: trigger.path.replace(/^\//, ""),
						};
					case "schedule":
						return {
							type: "timerTrigger",
							direction: "in",
							name: "timer",
							schedule: trigger.expression,
						};
					case "queue":
						return {
							type: "queueTrigger",
							direction: "in",
							name: "queueItem",
							queueName: trigger.queueName,
							connection: "AzureWebJobsStorage",
						};
					case "storage":
						return {
							type: "blobTrigger",
							direction: "in",
							name: "blob",
							path: `${trigger.bucket}/{name}`,
							connection: "AzureWebJobsStorage",
						};
					default:
						return null;
				}
			})
			.filter(Boolean);

		// Add output binding for HTTP functions
		if (func.triggers.some((t) => t.type === "http")) {
			bindings.push({
				type: "http",
				direction: "out",
				name: "res",
			});
		}

		return JSON.stringify(
			{
				bindings,
				scriptFile: `../dist/${func.name}/index.js`,
				entryPoint: "handler",
			},
			null,
			2,
		);
	}

	private generateAzureARMTemplate(options: ServerlessScalingOptions): string {
		return JSON.stringify(
			{
				$schema:
					"https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
				contentVersion: "1.0.0.0",
				parameters: {
					functionAppName: {
						type: "string",
						defaultValue: options.projectName,
					},
					storageAccountName: {
						type: "string",
						defaultValue: `${options.projectName.toLowerCase().replace(/-/g, "")}storage`,
					},
					location: {
						type: "string",
						defaultValue: "[resourceGroup().location]",
					},
					runtime: {
						type: "string",
						defaultValue: "node",
						allowedValues: ["node", "python", "dotnet", "java"],
					},
				},
				variables: {
					functionAppName: "[parameters('functionAppName')]",
					hostingPlanName: "[concat(parameters('functionAppName'), '-plan')]",
					applicationInsightsName:
						"[concat(parameters('functionAppName'), '-insights')]",
					storageAccountName: "[parameters('storageAccountName')]",
				},
				resources: [
					{
						type: "Microsoft.Storage/storageAccounts",
						apiVersion: "2021-04-01",
						name: "[variables('storageAccountName')]",
						location: "[parameters('location')]",
						sku: {
							name: "Standard_LRS",
						},
						kind: "StorageV2",
					},
					{
						type: "Microsoft.Web/serverfarms",
						apiVersion: "2021-02-01",
						name: "[variables('hostingPlanName')]",
						location: "[parameters('location')]",
						sku: {
							name: "Y1",
							tier: "Dynamic",
						},
						properties: {
							reserved: true,
						},
					},
					{
						type: "Microsoft.Insights/components",
						apiVersion: "2020-02-02",
						name: "[variables('applicationInsightsName')]",
						location: "[parameters('location')]",
						kind: "web",
						properties: {
							Application_Type: "web",
						},
					},
					{
						type: "Microsoft.Web/sites",
						apiVersion: "2021-02-01",
						name: "[variables('functionAppName')]",
						location: "[parameters('location')]",
						kind: "functionapp,linux",
						dependsOn: [
							"[resourceId('Microsoft.Web/serverfarms', variables('hostingPlanName'))]",
							"[resourceId('Microsoft.Storage/storageAccounts', variables('storageAccountName'))]",
							"[resourceId('Microsoft.Insights/components', variables('applicationInsightsName'))]",
						],
						properties: {
							serverFarmId:
								"[resourceId('Microsoft.Web/serverfarms', variables('hostingPlanName'))]",
							siteConfig: {
								appSettings: [
									{
										name: "AzureWebJobsStorage",
										value:
											"[concat('DefaultEndpointsProtocol=https;AccountName=', variables('storageAccountName'), ';EndpointSuffix=', environment().suffixes.storage, ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('storageAccountName')), '2021-04-01').keys[0].value)]",
									},
									{
										name: "FUNCTIONS_EXTENSION_VERSION",
										value: "~4",
									},
									{
										name: "FUNCTIONS_WORKER_RUNTIME",
										value: "[parameters('runtime')]",
									},
									{
										name: "APPINSIGHTS_INSTRUMENTATIONKEY",
										value:
											"[reference(resourceId('Microsoft.Insights/components', variables('applicationInsightsName'))).InstrumentationKey]",
									},
								],
								cors: {
									allowedOrigins: ["*"],
								},
								use32BitWorkerProcess: false,
								ftpsState: "FtpsOnly",
								minTlsVersion: "1.2",
							},
							httpsOnly: true,
						},
					},
				],
				outputs: {
					functionAppUrl: {
						type: "string",
						value:
							"[concat('https://', variables('functionAppName'), '.azurewebsites.net')]",
					},
				},
			},
			null,
			2,
		);
	}

	private async generateGCPFunctionsConfig(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		// Generate cloudfunctions.yaml
		configs.push({
			name: "cloudfunctions.yaml",
			content: this.generateGCPCloudFunctionsYaml(options),
			path: "cloudfunctions.yaml",
		});

		// Generate Terraform configuration
		configs.push({
			name: "main.tf",
			content: this.generateGCPTerraform(options),
			path: "terraform/main.tf",
		});

		return configs;
	}

	private generateGCPCloudFunctionsYaml(
		options: ServerlessScalingOptions,
	): string {
		return `# Google Cloud Functions Configuration
project: ${options.projectName}
region: us-central1

functions:
${options.functions
	.map(
		(func) => `  - name: ${options.projectName}-${func.name}
    source: ./functions/${func.name}
    entry_point: handler
    runtime: ${this.getGCPRuntime(func.runtime)}
    memory: ${func.memory}MB
    timeout: ${func.timeout}s
    min_instances: ${func.scaling?.minConcurrency || 0}
    max_instances: ${func.scaling?.maxConcurrency || 1000}
    available_memory_mb: ${func.memory}
    environment_variables:${
			func.environment && Object.keys(func.environment).length > 0
				? Object.entries(func.environment)
						.map(
							([key, value]) => `
      ${key}: "${value}"`,
						)
						.join("")
				: `
      PROJECT_NAME: ${options.projectName}`
		}
    trigger:${func.triggers
			.map((trigger) => {
				switch (trigger.type) {
					case "http":
						return `
      type: http
      security_level: secure_always`;
					case "schedule":
						return `
      type: pubsub
      resource: projects/${options.projectName}/topics/${func.name}-schedule
      schedule: "${trigger.expression}"`;
					case "storage":
						return `
      type: storage
      resource: ${trigger.bucket}
      event_type: ${trigger.events?.[0] || "google.storage.object.finalize"}`;
					default:
						return "";
				}
			})
			.join("")}
    vpc_connector: projects/${options.projectName}/locations/us-central1/connectors/serverless-connector
    ingress_settings: ALLOW_ALL
    labels:
      service: ${func.name}
      type: ${func.type}
      managed-by: xaheen-cli`,
	)
	.join("\n")}

# Cloud Run configuration for container-based functions
cloud_run:
  cpu: 2
  memory: 2Gi
  concurrency: 100
  timeout: 300s
  service_account: ${options.projectName}-functions@\${project_id}.iam.gserviceaccount.com

# Auto-scaling policies
autoscaling:
  min_instances: ${Math.min(...options.functions.map((f) => f.scaling?.minConcurrency || 0))}
  max_instances: ${Math.max(...options.functions.map((f) => f.scaling?.maxConcurrency || 1000))}
  target_cpu_utilization: ${Math.min(...options.functions.map((f) => f.scaling?.targetUtilization || 0.7))}
  target_request_latency: 500ms
`;
	}

	private generateGCPTerraform(options: ServerlessScalingOptions): string {
		const functions = options.functions
			.map(
				(func) => `
resource "google_cloudfunctions2_function" "${func.name}_function" {
  name        = "${options.projectName}-${func.name}"
  location    = var.region
  description = "${func.name} function for ${options.projectName}"

  build_config {
    runtime     = "${this.getGCPRuntime(func.runtime)}"
    entry_point = "handler"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_bucket.name
        object = google_storage_bucket_object.${func.name}_source.name
      }
    }
  }

  service_config {
    max_instance_count    = ${func.scaling?.maxConcurrency || 1000}
    min_instance_count    = ${func.scaling?.minConcurrency || 0}
    available_memory      = "${func.memory}M"
    timeout_seconds       = ${func.timeout}
    ingress_settings      = "ALLOW_ALL"
    all_traffic_on_latest_revision = true
    service_account_email = google_service_account.function_sa.email

    environment_variables = {
      PROJECT_NAME = "${options.projectName}"
      FUNCTION_NAME = "${func.name}"${
				func.environment && Object.keys(func.environment).length > 0
					? Object.entries(func.environment)
							.map(
								([key, value]) => `
      ${key} = "${value}"`,
							)
							.join("")
					: ""
			}
    }
  }

  ${func.triggers
		.map((trigger) => {
			switch (trigger.type) {
				case "http":
					return `event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.audit.log.v1.written"
    retry_policy   = "RETRY_POLICY_DO_NOT_RETRY"
  }`;
				case "schedule":
					return `event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.${func.name}_schedule.id
    retry_policy   = "RETRY_POLICY_RETRY"
  }`;
				case "storage":
					return `event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.storage.object.v1.finalized"
    retry_policy   = "RETRY_POLICY_RETRY"
    
    event_filters {
      attribute = "bucket"
      value     = "${trigger.bucket}"
    }
  }`;
				default:
					return "";
			}
		})
		.join("\n  ")}

  labels = {
    service    = "${func.name}"
    type       = "${func.type}"
    managed-by = "xaheen-cli"
  }
}

resource "google_storage_bucket_object" "${func.name}_source" {
  name   = "functions/${func.name}-\${data.archive_file.${func.name}_source.output_md5}.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = data.archive_file.${func.name}_source.output_path
}

data "archive_file" "${func.name}_source" {
  type        = "zip"
  source_dir  = "\${path.module}/functions/${func.name}"
  output_path = "\${path.module}/tmp/${func.name}.zip"
}`,
			)
			.join("\n");

		return `terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "${options.projectName}"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

resource "google_storage_bucket" "functions_bucket" {
  name     = "\${var.project_id}-functions"
  location = var.region
}

resource "google_service_account" "function_sa" {
  account_id   = "\${var.project_id}-functions"
  display_name = "Cloud Functions Service Account"
}

resource "google_project_iam_member" "function_sa_invoker" {
  project = var.project_id
  role    = "roles/cloudfunctions.invoker"
  member  = "serviceAccount:\${google_service_account.function_sa.email}"
}

${functions}

output "function_urls" {
  value = {
${options.functions
	.map(
		(func) =>
			`    ${func.name} = google_cloudfunctions2_function.${func.name}_function.service_config[0].uri`,
	)
	.join("\n")}
  }
}
`;
	}

	private async generateVercelConfig(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		// Generate vercel.json
		configs.push({
			name: "vercel.json",
			content: this.generateVercelJson(options),
			path: "vercel.json",
		});

		// Generate API routes
		for (const func of options.functions.filter((f) =>
			f.triggers.some((t) => t.type === "http"),
		)) {
			configs.push({
				name: `${func.name}.ts`,
				content: this.generateVercelFunction(func),
				path: `api/${func.name}.ts`,
			});
		}

		return configs;
	}

	private generateVercelJson(options: ServerlessScalingOptions): string {
		const routes = options.functions
			.filter((f) => f.triggers.some((t) => t.type === "http"))
			.flatMap((func) =>
				func.triggers
					.filter((t) => t.type === "http")
					.map((trigger) => ({
						src: trigger.path,
						dest: `/api/${func.name}`,
						methods: trigger.methods,
					})),
			);

		return JSON.stringify(
			{
				version: 2,
				regions: options.edgeLocations || ["iad1"],
				functions: Object.fromEntries(
					options.functions
						.filter((f) => f.triggers.some((t) => t.type === "http"))
						.map((func) => [
							`api/${func.name}.ts`,
							{
								maxDuration: func.timeout,
								memory: func.memory,
								runtime: this.getVercelRuntime(func.runtime),
							},
						]),
				),
				routes,
				env: {
					PROJECT_NAME: options.projectName,
				},
				build: {
					env: {
						NODE_ENV: "production",
					},
				},
				github: {
					enabled: true,
					autoAlias: true,
				},
			},
			null,
			2,
		);
	}

	private generateVercelFunction(
		func: ServerlessScalingOptions["functions"][0],
	): string {
		return `import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: '${this.getVercelRuntime(func.runtime)}',
  maxDuration: ${func.timeout},
  memory: ${func.memory},
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Import and execute the actual handler
    const { handler: functionHandler } = await import('../src/handlers/${func.name}');
    const result = await functionHandler(req, res);
    
    if (!res.headersSent) {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Function error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
`;
	}

	private async generateNetlifyConfig(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		// Generate netlify.toml
		configs.push({
			name: "netlify.toml",
			content: this.generateNetlifyToml(options),
			path: "netlify.toml",
		});

		// Generate function files
		for (const func of options.functions) {
			configs.push({
				name: `${func.name}.ts`,
				content: this.generateNetlifyFunction(func),
				path: `netlify/functions/${func.name}.ts`,
			});
		}

		return configs;
	}

	private generateNetlifyToml(options: ServerlessScalingOptions): string {
		const functions = options.functions
			.filter((f) => f.triggers.some((t) => t.type === "http"))
			.map((func) => {
				const httpTrigger = func.triggers.find((t) => t.type === "http");
				return `[[redirects]]
  from = "${httpTrigger?.path || `/api/${func.name}`}"
  to = "/.netlify/functions/${func.name}"
  status = 200`;
			})
			.join("\n\n");

		const scheduledFunctions = options.functions
			.filter((f) => f.triggers.some((t) => t.type === "schedule"))
			.map((func) => {
				const scheduleTrigger = func.triggers.find(
					(t) => t.type === "schedule",
				);
				return `[[functions]]
  name = "${func.name}"
  schedule = "${scheduleTrigger?.expression}"`;
			})
			.join("\n\n");

		return `[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  PROJECT_NAME = "${options.projectName}"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  
${functions}

${scheduledFunctions}

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"

[[plugins]]
  package = "@netlify/plugin-functions-install-core"

[dev]
  command = "npm run dev"
  port = 3000
  targetPort = 3001
  autoLaunch = true
`;
	}

	private generateNetlifyFunction(
		func: ServerlessScalingOptions["functions"][0],
	): string {
		return `import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Import and execute the actual handler
    const { handler: functionHandler } = await import('../../src/handlers/${func.name}');
    const result = await functionHandler(event, context);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
`;
	}

	private async generateCloudflareConfig(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		// Generate wrangler.toml
		configs.push({
			name: "wrangler.toml",
			content: this.generateWranglerToml(options),
			path: "wrangler.toml",
		});

		// Generate worker script
		configs.push({
			name: "worker.ts",
			content: this.generateCloudflareWorker(options),
			path: "src/worker.ts",
		});

		return configs;
	}

	private generateWranglerToml(options: ServerlessScalingOptions): string {
		return `name = "${options.projectName}"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "${options.projectName}-production"
route = { pattern = "*.${options.projectName}.com/*", zone_name = "${options.projectName}.com" }

[env.staging]
name = "${options.projectName}-staging"
route = { pattern = "staging.${options.projectName}.com/*", zone_name = "${options.projectName}.com" }

[[kv_namespaces]]
binding = "KV_CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

[[r2_buckets]]
binding = "R2_STORAGE"
bucket_name = "${options.projectName}-storage"

[[d1_databases]]
binding = "DB"
database_name = "${options.projectName}-db"
database_id = "your-database-id"

[triggers]
crons = [${options.functions
			.filter((f) => f.triggers.some((t) => t.type === "schedule"))
			.map((func) => {
				const scheduleTrigger = func.triggers.find(
					(t) => t.type === "schedule",
				);
				return `"${scheduleTrigger?.expression}"`;
			})
			.join(", ")}]

[observability]
enabled = true

[limits]
cpu_ms = ${Math.max(...options.functions.map((f) => f.timeout)) * 1000}

[placement]
mode = "smart"

[tail_consumers]
urls = ["https://logs.${options.projectName}.com/ingest"]
`;
	}

	private generateCloudflareWorker(options: ServerlessScalingOptions): string {
		const routes = options.functions
			.filter((f) => f.triggers.some((t) => t.type === "http"))
			.map((func) => {
				const httpTrigger = func.triggers.find((t) => t.type === "http");
				return `  router.${httpTrigger?.methods?.[0]?.toLowerCase() || "all"}('${
					httpTrigger?.path || `/api/${func.name}`
				}', async (request, env, ctx) => {
    return handleFunction('${func.name}', request, env, ctx);
  });`;
			})
			.join("\n");

		return `import { Router } from 'itty-router';

export interface Env {
  KV_CACHE: KVNamespace;
  R2_STORAGE: R2Bucket;
  DB: D1Database;
  PROJECT_NAME: string;
}

const router = Router();

// Health check endpoint
router.get('/health', () => new Response('OK', { status: 200 }));

// Function routes
${routes}

// Handle scheduled events
export async function scheduled(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  // Handle scheduled functions
  ${options.functions
		.filter((f) => f.triggers.some((t) => t.type === "schedule"))
		.map(
			(func) =>
				`await handleScheduledFunction('${func.name}', controller, env, ctx);`,
		)
		.join("\n  ")}
}

// Main request handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Add CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      // Handle OPTIONS requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Route the request
      const response = await router.handle(request, env, ctx);
      
      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
  scheduled,
};

async function handleFunction(
  functionName: string,
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    // Import and execute the function handler
    const module = await import(\`./handlers/\${functionName}\`);
    const result = await module.handler(request, env, ctx);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(\`Function \${functionName} error:\`, error);
    throw error;
  }
}

async function handleScheduledFunction(
  functionName: string,
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  try {
    const module = await import(\`./handlers/\${functionName}\`);
    await module.scheduledHandler(controller, env, ctx);
  } catch (error) {
    console.error(\`Scheduled function \${functionName} error:\`, error);
    throw error;
  }
}
`;
	}

	private async generateCommonConfigs(
		options: ServerlessScalingOptions,
	): Promise<ServerlessConfig[]> {
		const configs: ServerlessConfig[] = [];

		// Generate package.json scripts
		configs.push({
			name: "package.json",
			content: this.generatePackageJson(options),
			path: "package.json",
		});

		// Generate environment configuration
		configs.push({
			name: ".env.example",
			content: this.generateEnvExample(options),
			path: ".env.example",
		});

		// Generate GitHub Actions workflow
		configs.push({
			name: "serverless-deploy.yml",
			content: this.generateGitHubActionsWorkflow(options),
			path: ".github/workflows/serverless-deploy.yml",
		});

		return configs;
	}

	private generatePackageJson(options: ServerlessScalingOptions): string {
		const scripts: Record<string, string> = {
			build: "tsc",
			"build:prod": "tsc --build tsconfig.prod.json",
			test: "jest",
			"test:integration": "jest --testPathPattern=integration",
			lint: "eslint src --ext .ts",
			format: "prettier --write 'src/**/*.ts'",
		};

		// Add provider-specific scripts
		switch (options.provider) {
			case "aws-lambda":
				scripts.deploy = "serverless deploy";
				scripts["deploy:prod"] = "serverless deploy --stage production";
				scripts.logs = "serverless logs -f";
				scripts.invoke = "serverless invoke local -f";
				break;
			case "azure-functions":
				scripts.start = "func start";
				scripts.deploy = "func azure functionapp publish";
				break;
			case "gcp-functions":
				scripts.deploy = "gcloud functions deploy";
				scripts.logs = "gcloud functions logs read";
				break;
			case "vercel":
				scripts.dev = "vercel dev";
				scripts.deploy = "vercel";
				scripts["deploy:prod"] = "vercel --prod";
				break;
			case "netlify":
				scripts.dev = "netlify dev";
				scripts.deploy = "netlify deploy";
				scripts["deploy:prod"] = "netlify deploy --prod";
				break;
			case "cloudflare":
				scripts.dev = "wrangler dev";
				scripts.deploy = "wrangler deploy";
				scripts.tail = "wrangler tail";
				break;
		}

		const dependencies: Record<string, string> = {
			axios: "^1.6.0",
			dotenv: "^16.3.1",
		};

		const devDependencies: Record<string, string> = {
			"@types/node": "^20.10.0",
			typescript: "^5.3.0",
			jest: "^29.7.0",
			"@types/jest": "^29.5.0",
			eslint: "^8.55.0",
			prettier: "^3.1.0",
		};

		// Add provider-specific dependencies
		switch (options.provider) {
			case "aws-lambda":
				dependencies["aws-sdk"] = "^2.1500.0";
				dependencies["aws-lambda"] = "^1.0.7";
				devDependencies["@types/aws-lambda"] = "^8.10.130";
				devDependencies["serverless"] = "^3.38.0";
				break;
			case "azure-functions":
				dependencies["@azure/functions"] = "^4.0.0";
				devDependencies["azure-functions-core-tools"] = "^4.0.0";
				break;
			case "gcp-functions":
				dependencies["@google-cloud/functions-framework"] = "^3.3.0";
				break;
			case "vercel":
				dependencies["@vercel/node"] = "^3.0.0";
				devDependencies["vercel"] = "^32.0.0";
				break;
			case "netlify":
				dependencies["@netlify/functions"] = "^2.4.0";
				devDependencies["netlify-cli"] = "^17.0.0";
				break;
			case "cloudflare":
				dependencies["itty-router"] = "^4.0.0";
				devDependencies["wrangler"] = "^3.20.0";
				devDependencies["@cloudflare/workers-types"] = "^4.0.0";
				break;
		}

		return JSON.stringify(
			{
				name: options.projectName,
				version: "1.0.0",
				description: `${options.projectName} Serverless Functions`,
				main: "dist/index.js",
				scripts,
				dependencies,
				devDependencies,
				engines: {
					node: ">=18.0.0",
				},
			},
			null,
			2,
		);
	}

	private generateEnvExample(options: ServerlessScalingOptions): string {
		const envVars = [
			`PROJECT_NAME=${options.projectName}`,
			"STAGE=development",
			"",
			"# Provider Configuration",
		];

		switch (options.provider) {
			case "aws-lambda":
				envVars.push(
					"AWS_REGION=us-east-1",
					"AWS_ACCESS_KEY_ID=your-access-key",
					"AWS_SECRET_ACCESS_KEY=your-secret-key",
				);
				break;
			case "azure-functions":
				envVars.push(
					"AZURE_SUBSCRIPTION_ID=your-subscription-id",
					"AZURE_TENANT_ID=your-tenant-id",
					"AZURE_CLIENT_ID=your-client-id",
					"AZURE_CLIENT_SECRET=your-client-secret",
				);
				break;
			case "gcp-functions":
				envVars.push(
					"GCP_PROJECT_ID=your-project-id",
					"GCP_REGION=us-central1",
					"GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json",
				);
				break;
			case "vercel":
				envVars.push(
					"VERCEL_TOKEN=your-vercel-token",
					"VERCEL_ORG_ID=your-org-id",
				);
				break;
			case "netlify":
				envVars.push(
					"NETLIFY_AUTH_TOKEN=your-netlify-token",
					"NETLIFY_SITE_ID=your-site-id",
				);
				break;
			case "cloudflare":
				envVars.push(
					"CLOUDFLARE_API_TOKEN=your-api-token",
					"CLOUDFLARE_ACCOUNT_ID=your-account-id",
				);
				break;
		}

		// Add monitoring configuration
		if (options.monitoring?.enabled) {
			envVars.push("", "# Monitoring Configuration");
			switch (options.monitoring.provider) {
				case "datadog":
					envVars.push(
						"DD_API_KEY=your-datadog-api-key",
						"DD_SITE=datadoghq.com",
					);
					break;
				case "newrelic":
					envVars.push("NEW_RELIC_LICENSE_KEY=your-license-key");
					break;
			}
		}

		// Add function-specific environment variables
		options.functions.forEach((func) => {
			if (func.environment) {
				envVars.push("", `# ${func.name} Function Variables`);
				Object.entries(func.environment).forEach(([key, value]) => {
					if (typeof value === "string" && value.includes("secret")) {
						envVars.push(`${key}=your-${key.toLowerCase()}`);
					} else {
						envVars.push(`${key}=${value}`);
					}
				});
			}
		});

		return envVars.join("\n");
	}

	private generateGitHubActionsWorkflow(
		options: ServerlessScalingOptions,
	): string {
		const deploySteps: string[] = [];

		switch (options.provider) {
			case "aws-lambda":
				deploySteps.push(
					`      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy with Serverless Framework
        run: npx serverless deploy --stage \${{ matrix.stage }}`,
				);
				break;
			case "azure-functions":
				deploySteps.push(
					`      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: \${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure Functions
        uses: Azure/functions-action@v1
        with:
          app-name: ${options.projectName}
          package: .`,
				);
				break;
			case "gcp-functions":
				deploySteps.push(
					`      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: \${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Functions
        uses: google-github-actions/deploy-cloud-functions@v1
        with:
          name: ${options.projectName}
          runtime: ${options.functions[0]?.runtime || "nodejs18"}
          region: us-central1`,
				);
				break;
			case "vercel":
				deploySteps.push(
					`      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: \${{ matrix.stage == 'production' && '--prod' || '' }}`,
				);
				break;
			case "netlify":
				deploySteps.push(
					`      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: \${{ matrix.stage == 'production' }}
          github-token: \${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Deploy from GitHub Actions'
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}`,
				);
				break;
			case "cloudflare":
				deploySteps.push(
					`      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          environment: \${{ matrix.stage }}`,
				);
				break;
		}

		return `name: Serverless Deployment

on:
  push:
    branches:
      - main
      - staging
  pull_request:
    branches:
      - main

env:
  NODE_VERSION: '18'
  PROJECT_NAME: ${options.projectName}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    strategy:
      matrix:
        stage: [staging, production]
        exclude:
          - stage: production
            branch: staging
          - stage: staging
            branch: main

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:prod

${deploySteps.join("\n")}

      - name: Run smoke tests
        if: success()
        run: |
          echo "Running smoke tests for \${{ matrix.stage }} environment"
          # Add smoke test commands here

      - name: Notify deployment
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: 'Deployment to \${{ matrix.stage }} \${{ job.status }}'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
`;
	}

	private async generateMonitoringConfig(
		options: ServerlessScalingOptions,
	): Promise<void> {
		const monitoringPath = path.join(options.projectPath, "monitoring");
		await fs.mkdir(monitoringPath, { recursive: true });

		// Generate monitoring configuration based on provider
		const monitoringConfig = {
			provider: options.monitoring?.provider || "cloudwatch",
			enabled: options.monitoring?.enabled ?? true,
			customMetrics: options.monitoring?.customMetrics ?? false,
			tracing: options.monitoring?.tracing ?? true,
			profiling: options.monitoring?.profiling ?? false,
			functions: options.functions.map((func) => ({
				name: func.name,
				metrics: [
					{
						name: "invocations",
						type: "counter",
						unit: "count",
					},
					{
						name: "duration",
						type: "histogram",
						unit: "milliseconds",
					},
					{
						name: "errors",
						type: "counter",
						unit: "count",
					},
					{
						name: "cold_starts",
						type: "counter",
						unit: "count",
					},
					{
						name: "memory_utilization",
						type: "gauge",
						unit: "percent",
					},
				],
				alerts: [
					{
						name: `${func.name}_high_error_rate`,
						metric: "errors",
						threshold: 10,
						period: "5m",
						evaluationPeriods: 2,
					},
					{
						name: `${func.name}_high_duration`,
						metric: "duration",
						threshold: func.timeout * 0.8 * 1000, // 80% of timeout
						period: "5m",
						evaluationPeriods: 1,
					},
				],
			})),
			dashboards: [
				{
					name: `${options.projectName}-overview`,
					widgets: [
						{
							type: "line",
							title: "Function Invocations",
							metrics: options.functions.map((f) => `${f.name}.invocations`),
						},
						{
							type: "line",
							title: "Function Duration",
							metrics: options.functions.map((f) => `${f.name}.duration`),
						},
						{
							type: "number",
							title: "Total Errors",
							metric: "sum(*.errors)",
						},
						{
							type: "heatmap",
							title: "Cold Start Distribution",
							metrics: options.functions.map((f) => `${f.name}.cold_starts`),
						},
					],
				},
			],
		};

		await fs.writeFile(
			path.join(monitoringPath, "monitoring-config.json"),
			JSON.stringify(monitoringConfig, null, 2),
		);

		// Generate observability instrumentation
		const instrumentationCode = `import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { AwsLambdaInstrumentation } from '@opentelemetry/instrumentation-aws-lambda';

export function initializeTracing(serviceName: string): void {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.STAGE || 'development',
    }),
  });

  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new AwsLambdaInstrumentation({
        disableAwsContextPropagation: false,
      }),
    ],
  });
}

export function captureMetric(name: string, value: number, unit: string = 'count'): void {
  // Implementation depends on monitoring provider
  console.log(\`Metric: \${name} = \${value} \${unit}\`);
}

export function captureError(error: Error, context?: Record<string, any>): void {
  console.error('Captured error:', error, context);
  // Send to error tracking service
}
`;

		await fs.writeFile(
			path.join(monitoringPath, "instrumentation.ts"),
			instrumentationCode,
		);
	}

	private async generateDeploymentScripts(
		options: ServerlessScalingOptions,
	): Promise<void> {
		const scriptsPath = path.join(options.projectPath, "scripts");
		await fs.mkdir(scriptsPath, { recursive: true });

		// Generate deployment script
		const deployScript = `#!/bin/bash

# Serverless Deployment Script
# Generated by Xaheen CLI

set -e

PROJECT_NAME="${options.projectName}"
PROVIDER="${options.provider}"
STAGE=\${1:-staging}

echo "🚀 Deploying $PROJECT_NAME to $STAGE environment"

# Validate environment
if [ ! -f ".env.$STAGE" ]; then
  echo "❌ Environment file .env.$STAGE not found"
  exit 1
fi

# Load environment variables
export $(cat .env.$STAGE | xargs)

# Run tests
echo "🧪 Running tests..."
npm test

# Build the project
echo "🔨 Building project..."
npm run build:prod

# Provider-specific deployment
case "$PROVIDER" in
  "aws-lambda")
    echo "☁️ Deploying to AWS Lambda..."
    npx serverless deploy --stage $STAGE
    ;;
  "azure-functions")
    echo "☁️ Deploying to Azure Functions..."
    func azure functionapp publish $PROJECT_NAME-$STAGE
    ;;
  "gcp-functions")
    echo "☁️ Deploying to Google Cloud Functions..."
    gcloud functions deploy $PROJECT_NAME --runtime ${options.functions[0]?.runtime || "nodejs18"} --region us-central1
    ;;
  "vercel")
    echo "▲ Deploying to Vercel..."
    if [ "$STAGE" == "production" ]; then
      vercel --prod
    else
      vercel
    fi
    ;;
  "netlify")
    echo "🔷 Deploying to Netlify..."
    if [ "$STAGE" == "production" ]; then
      netlify deploy --prod
    else
      netlify deploy
    fi
    ;;
  "cloudflare")
    echo "☁️ Deploying to Cloudflare Workers..."
    wrangler deploy --env $STAGE
    ;;
  *)
    echo "❌ Unknown provider: $PROVIDER"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"

# Run smoke tests
echo "🔥 Running smoke tests..."
npm run test:smoke -- --stage $STAGE

echo "🎉 Deployment successful!"
`;

		await fs.writeFile(path.join(scriptsPath, "deploy.sh"), deployScript);
		await fs.chmod(path.join(scriptsPath, "deploy.sh"), 0o755);

		// Generate rollback script
		const rollbackScript = `#!/bin/bash

# Serverless Rollback Script
# Generated by Xaheen CLI

set -e

PROJECT_NAME="${options.projectName}"
PROVIDER="${options.provider}"
STAGE=\${1:-staging}
VERSION=\${2}

echo "🔄 Rolling back $PROJECT_NAME in $STAGE environment"

if [ -z "$VERSION" ]; then
  echo "❌ Version not specified. Usage: ./rollback.sh <stage> <version>"
  exit 1
fi

# Provider-specific rollback
case "$PROVIDER" in
  "aws-lambda")
    echo "☁️ Rolling back AWS Lambda to version $VERSION..."
    aws lambda update-alias --function-name $PROJECT_NAME-$STAGE --function-version $VERSION --name live
    ;;
  "vercel")
    echo "▲ Rolling back Vercel deployment..."
    vercel rollback $VERSION
    ;;
  *)
    echo "⚠️ Rollback not implemented for $PROVIDER"
    echo "Please perform manual rollback"
    exit 1
    ;;
esac

echo "✅ Rollback complete!"
`;

		await fs.writeFile(path.join(scriptsPath, "rollback.sh"), rollbackScript);
		await fs.chmod(path.join(scriptsPath, "rollback.sh"), 0o755);
	}

	private async generateCostOptimizationConfig(
		options: ServerlessScalingOptions,
	): Promise<void> {
		const costPath = path.join(options.projectPath, "cost-optimization");
		await fs.mkdir(costPath, { recursive: true });

		// Generate cost analysis configuration
		const costConfig = {
			optimization: {
				enabled: options.costOptimization?.enabled ?? true,
				spotPricing: options.costOptimization?.spotPricing ?? false,
				computeSavingsPlan:
					options.costOptimization?.computeSavingsPlan ?? false,
				idleTimeout: options.costOptimization?.idleTimeout ?? 300,
			},
			functions: options.functions.map((func) => ({
				name: func.name,
				memory: func.memory,
				timeout: func.timeout,
				estimatedInvocationsPerMonth: 100000, // Default estimate
				estimatedDurationMs: func.timeout * 0.3 * 1000, // 30% of timeout
				costPerMonth: this.calculateFunctionCost(func, 100000),
				optimizations: [
					{
						type: "memory",
						current: func.memory,
						recommended: this.recommendOptimalMemory(func),
						savingsPercent: 15,
					},
					{
						type: "timeout",
						current: func.timeout,
						recommended: Math.max(5, func.timeout * 0.5),
						savingsPercent: 10,
					},
				],
			})),
			totalEstimatedCost: options.functions.reduce(
				(acc, func) => acc + this.calculateFunctionCost(func, 100000),
				0,
			),
			recommendations: [
				"Consider using provisioned concurrency for predictable traffic patterns",
				"Implement request batching to reduce invocation count",
				"Use Lambda@Edge for global distribution if applicable",
				"Consider using Step Functions for complex workflows",
			],
		};

		await fs.writeFile(
			path.join(costPath, "cost-analysis.json"),
			JSON.stringify(costConfig, null, 2),
		);

		// Generate cost monitoring dashboard configuration
		const costDashboard = `# Cost Monitoring Dashboard Configuration
# Generated by Xaheen CLI

dashboard:
  name: ${options.projectName}-cost-monitoring
  refresh: 1h
  
widgets:
  - type: number
    title: "Monthly Cost (USD)"
    query: "SUM(estimated_cost)"
    
  - type: line
    title: "Cost Trend"
    query: "estimated_cost BY day"
    
  - type: pie
    title: "Cost by Function"
    query: "estimated_cost BY function_name"
    
  - type: bar
    title: "Invocations by Function"
    query: "invocation_count BY function_name"
    
  - type: table
    title: "Cost Optimization Opportunities"
    columns:
      - function_name
      - current_cost
      - optimized_cost
      - savings_percent
      
alerts:
  - name: high_cost_alert
    condition: "monthly_cost > 1000"
    severity: warning
    notification: email
    
  - name: cost_spike_alert
    condition: "daily_cost > daily_cost_avg * 2"
    severity: critical
    notification: slack
`;

		await fs.writeFile(
			path.join(costPath, "cost-dashboard.yaml"),
			costDashboard,
		);
	}

	private async writeConfigurations(
		configs: ServerlessConfig[],
		projectPath: string,
	): Promise<void> {
		for (const config of configs) {
			const filePath = path.join(projectPath, config.path);
			const dir = path.dirname(filePath);

			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(filePath, config.content);

			console.log(chalk.gray(`  Created: ${config.path}`));
		}
	}

	private getGCPRuntime(runtime: string): string {
		const runtimeMap: Record<string, string> = {
			nodejs18: "nodejs18",
			nodejs20: "nodejs20",
			"python3.11": "python311",
			"go1.21": "go121",
			java17: "java17",
			dotnet6: "dotnet6",
		};
		return runtimeMap[runtime] || "nodejs18";
	}

	private getVercelRuntime(runtime: string): string {
		const runtimeMap: Record<string, string> = {
			nodejs18: "nodejs18.x",
			nodejs20: "nodejs20.x",
			"python3.11": "python3.11",
			"go1.21": "go1.x",
		};
		return runtimeMap[runtime] || "nodejs18.x";
	}

	private calculateFunctionCost(
		func: ServerlessScalingOptions["functions"][0],
		invocations: number,
	): number {
		// AWS Lambda pricing model (simplified)
		const pricePerGBSecond = 0.0000166667;
		const pricePerRequest = 0.0000002;
		const freeRequests = 1000000;
		const freeGBSeconds = 400000;

		const gbSeconds = (func.memory / 1024) * (func.timeout * 0.3) * invocations;
		const billableGBSeconds = Math.max(0, gbSeconds - freeGBSeconds);
		const billableRequests = Math.max(0, invocations - freeRequests);

		return (
			billableGBSeconds * pricePerGBSecond + billableRequests * pricePerRequest
		);
	}

	private recommendOptimalMemory(
		func: ServerlessScalingOptions["functions"][0],
	): number {
		// Simple heuristic for memory optimization
		if (func.type === "api") {
			return 512; // APIs typically need less memory
		} else if (func.type === "stream" || func.type === "queue") {
			return 1024; // Stream processing needs moderate memory
		} else {
			return func.memory; // Keep current for others
		}
	}
}

// Export factory function
export function createServerlessScalingGenerator(): ServerlessScalingGenerator {
	return new ServerlessScalingGenerator();
}
