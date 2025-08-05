import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import { z } from "zod";
import { BaseGenerator } from "../base.generator";

// Auto-scaling configuration schema
const AutoScalingOptionsSchema = z.object({
	projectName: z.string(),
	projectPath: z.string(),
	provider: z
		.enum(["kubernetes", "aws", "azure", "gcp", "serverless"])
		.default("kubernetes"),
	services: z.array(
		z.object({
			name: z.string(),
			type: z.enum(["api", "web", "worker", "database", "cache"]),
			minReplicas: z.number().min(1).default(2),
			maxReplicas: z.number().min(1).default(10),
			targetCPU: z.number().min(1).max(100).default(70),
			targetMemory: z.number().min(1).max(100).optional(),
			targetRequestsPerSecond: z.number().optional(),
			scaleDownDelay: z.string().default("5m"),
			scaleUpDelay: z.string().default("30s"),
		}),
	),
	metrics: z
		.object({
			enabled: z.boolean().default(true),
			provider: z
				.enum(["prometheus", "cloudwatch", "stackdriver", "azure-monitor"])
				.optional(),
			customMetrics: z
				.array(
					z.object({
						name: z.string(),
						query: z.string(),
						threshold: z.number(),
					}),
				)
				.optional(),
		})
		.optional(),
	costOptimization: z
		.object({
			enabled: z.boolean().default(true),
			spotInstances: z.boolean().default(false),
			scheduledScaling: z
				.array(
					z.object({
						name: z.string(),
						schedule: z.string(), // Cron expression
						minReplicas: z.number(),
						maxReplicas: z.number(),
					}),
				)
				.optional(),
		})
		.optional(),
	healthChecks: z
		.object({
			enabled: z.boolean().default(true),
			livenessProbe: z
				.object({
					path: z.string().default("/health"),
					interval: z.string().default("30s"),
					timeout: z.string().default("10s"),
				})
				.optional(),
			readinessProbe: z
				.object({
					path: z.string().default("/ready"),
					interval: z.string().default("10s"),
					timeout: z.string().default("5s"),
				})
				.optional(),
		})
		.optional(),
});

export type AutoScalingOptions = z.infer<typeof AutoScalingOptionsSchema>;

interface AutoScalingManifest {
	name: string;
	content: string;
	path: string;
}

export class AutoScalingGenerator extends BaseGenerator {
	async generate(options: AutoScalingOptions): Promise<void> {
		try {
			// Validate options
			const validatedOptions = AutoScalingOptionsSchema.parse(options);

			console.log(chalk.blue("🚀 Generating Auto-Scaling Infrastructure..."));

			// Generate manifests based on provider
			const manifests = await this.generateManifests(validatedOptions);

			// Write manifests to filesystem
			await this.writeManifests(manifests, validatedOptions.projectPath);

			// Generate monitoring configuration
			if (validatedOptions.metrics?.enabled) {
				await this.generateMonitoringConfig(validatedOptions);
			}

			// Generate cost optimization configuration
			if (validatedOptions.costOptimization?.enabled) {
				await this.generateCostOptimizationConfig(validatedOptions);
			}

			console.log(
				chalk.green("✅ Auto-scaling infrastructure generated successfully!"),
			);
		} catch (error) {
			console.error(
				chalk.red("❌ Error generating auto-scaling infrastructure:"),
				error,
			);
			throw error;
		}
	}

	private async generateManifests(
		options: AutoScalingOptions,
	): Promise<AutoScalingManifest[]> {
		const manifests: AutoScalingManifest[] = [];

		switch (options.provider) {
			case "kubernetes":
				manifests.push(...(await this.generateKubernetesManifests(options)));
				break;
			case "aws":
				manifests.push(...(await this.generateAWSManifests(options)));
				break;
			case "azure":
				manifests.push(...(await this.generateAzureManifests(options)));
				break;
			case "gcp":
				manifests.push(...(await this.generateGCPManifests(options)));
				break;
			case "serverless":
				manifests.push(...(await this.generateServerlessManifests(options)));
				break;
		}

		return manifests;
	}

	private async generateKubernetesManifests(
		options: AutoScalingOptions,
	): Promise<AutoScalingManifest[]> {
		const manifests: AutoScalingManifest[] = [];

		// Generate HPA (Horizontal Pod Autoscaler) for each service
		for (const service of options.services) {
			const hpaManifest = this.generateKubernetesHPA(service, options);
			manifests.push({
				name: `hpa-${service.name}.yaml`,
				content: hpaManifest,
				path: `k8s/autoscaling/hpa-${service.name}.yaml`,
			});

			// Generate VPA (Vertical Pod Autoscaler) if needed
			if (service.type !== "database") {
				const vpaManifest = this.generateKubernetesVPA(service, options);
				manifests.push({
					name: `vpa-${service.name}.yaml`,
					content: vpaManifest,
					path: `k8s/autoscaling/vpa-${service.name}.yaml`,
				});
			}

			// Generate PodDisruptionBudget for high availability
			const pdbManifest = this.generatePodDisruptionBudget(service, options);
			manifests.push({
				name: `pdb-${service.name}.yaml`,
				content: pdbManifest,
				path: `k8s/autoscaling/pdb-${service.name}.yaml`,
			});
		}

		// Generate Cluster Autoscaler configuration
		manifests.push({
			name: "cluster-autoscaler.yaml",
			content: this.generateClusterAutoscaler(options),
			path: "k8s/autoscaling/cluster-autoscaler.yaml",
		});

		// Generate KEDA ScaledObject for advanced metrics
		if (options.metrics?.customMetrics) {
			manifests.push({
				name: "keda-scaledobjects.yaml",
				content: this.generateKEDAScaledObjects(options),
				path: "k8s/autoscaling/keda-scaledobjects.yaml",
			});
		}

		return manifests;
	}

	private generateKubernetesHPA(
		service: AutoScalingOptions["services"][0],
		options: AutoScalingOptions,
	): string {
		return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${service.name}-hpa
  namespace: ${options.projectName}
  labels:
    app: ${service.name}
    type: ${service.type}
    managed-by: xaheen-cli
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${service.name}
  minReplicas: ${service.minReplicas}
  maxReplicas: ${service.maxReplicas}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${service.targetCPU}${
					service.targetMemory
						? `
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: ${service.targetMemory}`
						: ""
				}${
					service.targetRequestsPerSecond
						? `
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "${service.targetRequestsPerSecond}"`
						: ""
				}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: ${this.parseTimeToSeconds(service.scaleDownDelay)}
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
      - type: Pods
        value: 1
        periodSeconds: 120
      selectPolicy: Min
    scaleUp:
      stabilizationWindowSeconds: ${this.parseTimeToSeconds(service.scaleUpDelay)}
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max
`;
	}

	private generateKubernetesVPA(
		service: AutoScalingOptions["services"][0],
		options: AutoScalingOptions,
	): string {
		return `apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: ${service.name}-vpa
  namespace: ${options.projectName}
  labels:
    app: ${service.name}
    type: ${service.type}
    managed-by: xaheen-cli
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${service.name}
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: ${service.name}
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
      controlledResources: ["cpu", "memory"]
`;
	}

	private generatePodDisruptionBudget(
		service: AutoScalingOptions["services"][0],
		options: AutoScalingOptions,
	): string {
		const minAvailable = Math.max(1, Math.floor(service.minReplicas * 0.5));
		return `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ${service.name}-pdb
  namespace: ${options.projectName}
  labels:
    app: ${service.name}
    type: ${service.type}
    managed-by: xaheen-cli
spec:
  minAvailable: ${minAvailable}
  selector:
    matchLabels:
      app: ${service.name}
  unhealthyPodEvictionPolicy: IfHealthyBudget
`;
	}

	private generateClusterAutoscaler(options: AutoScalingOptions): string {
		return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  labels:
    app: cluster-autoscaler
    managed-by: xaheen-cli
spec:
  selector:
    matchLabels:
      app: cluster-autoscaler
  replicas: 1
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.27.0
        name: cluster-autoscaler
        resources:
          limits:
            cpu: 100m
            memory: 300Mi
          requests:
            cpu: 100m
            memory: 300Mi
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=auto
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=auto
        - --balance-similar-node-groups
        - --skip-nodes-with-system-pods=false
        env:
        - name: NAMESPACE
          value: ${options.projectName}
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  labels:
    managed-by: xaheen-cli
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-autoscaler
  labels:
    managed-by: xaheen-cli
rules:
- apiGroups: [""]
  resources: ["events", "endpoints"]
  verbs: ["create", "patch"]
- apiGroups: [""]
  resources: ["pods/eviction"]
  verbs: ["create"]
- apiGroups: [""]
  resources: ["pods/status"]
  verbs: ["update"]
- apiGroups: [""]
  resources: ["endpoints"]
  resourceNames: ["cluster-autoscaler"]
  verbs: ["get", "update"]
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["watch", "list", "get", "update"]
- apiGroups: [""]
  resources: ["namespaces", "pods", "services", "replicationcontrollers", "persistentvolumeclaims", "persistentvolumes"]
  verbs: ["watch", "list", "get"]
- apiGroups: ["apps"]
  resources: ["daemonsets", "replicasets", "statefulsets"]
  verbs: ["watch", "list", "get"]
- apiGroups: ["policy"]
  resources: ["poddisruptionbudgets"]
  verbs: ["watch", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cluster-autoscaler
  labels:
    managed-by: xaheen-cli
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-autoscaler
subjects:
- kind: ServiceAccount
  name: cluster-autoscaler
  namespace: kube-system
`;
	}

	private generateKEDAScaledObjects(options: AutoScalingOptions): string {
		const scaledObjects = options.services
			.map((service) => {
				if (!options.metrics?.customMetrics) return "";

				return options.metrics.customMetrics
					.map(
						(metric) => `apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: ${service.name}-${metric.name}-scaledobject
  namespace: ${options.projectName}
  labels:
    app: ${service.name}
    managed-by: xaheen-cli
spec:
  scaleTargetRef:
    name: ${service.name}
  minReplicaCount: ${service.minReplicas}
  maxReplicaCount: ${service.maxReplicas}
  pollingInterval: 30
  cooldownPeriod: 300
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus:9090
      metricName: ${metric.name}
      query: ${metric.query}
      threshold: '${metric.threshold}'
`,
					)
					.join("---\n");
			})
			.filter(Boolean)
			.join("---\n");

		return scaledObjects;
	}

	private async generateAWSManifests(
		options: AutoScalingOptions,
	): Promise<AutoScalingManifest[]> {
		const manifests: AutoScalingManifest[] = [];

		// Generate AWS Auto Scaling Group configurations
		for (const service of options.services) {
			manifests.push({
				name: `${service.name}-asg.tf`,
				content: this.generateAWSAutoScalingGroup(service, options),
				path: `terraform/aws/autoscaling/${service.name}-asg.tf`,
			});

			// Generate Application Auto Scaling for ECS/Fargate
			if (service.type === "api" || service.type === "web") {
				manifests.push({
					name: `${service.name}-app-autoscaling.tf`,
					content: this.generateAWSApplicationAutoScaling(service, options),
					path: `terraform/aws/autoscaling/${service.name}-app-autoscaling.tf`,
				});
			}
		}

		// Generate CloudWatch alarms and dashboards
		manifests.push({
			name: "cloudwatch-autoscaling.tf",
			content: this.generateAWSCloudWatch(options),
			path: "terraform/aws/monitoring/cloudwatch-autoscaling.tf",
		});

		return manifests;
	}

	private generateAWSAutoScalingGroup(
		service: AutoScalingOptions["services"][0],
		options: AutoScalingOptions,
	): string {
		return `resource "aws_autoscaling_group" "${service.name}_asg" {
  name                = "${options.projectName}-${service.name}-asg"
  min_size            = ${service.minReplicas}
  max_size            = ${service.maxReplicas}
  desired_capacity    = ${service.minReplicas}
  health_check_type   = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.${service.name}_lt.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.${service.name}_tg.arn]

  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]

  tag {
    key                 = "Name"
    value               = "${options.projectName}-${service.name}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Service"
    value               = "${service.name}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Type"
    value               = "${service.type}"
    propagate_at_launch = true
  }

  tag {
    key                 = "ManagedBy"
    value               = "xaheen-cli"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "${service.name}_target_tracking" {
  name                   = "${options.projectName}-${service.name}-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.${service.name}_asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = ${service.targetCPU}.0
  }
}${
			service.targetMemory
				? `

resource "aws_autoscaling_policy" "${service.name}_memory_tracking" {
  name                   = "${options.projectName}-${service.name}-memory-tracking"
  autoscaling_group_name = aws_autoscaling_group.${service.name}_asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    customized_metric_specification {
      metric_dimension {
        name  = "AutoScalingGroupName"
        value = aws_autoscaling_group.${service.name}_asg.name
      }

      metric_name = "MemoryUtilization"
      namespace   = "CWAgent"
      statistic   = "Average"
    }
    target_value = ${service.targetMemory}.0
  }
}`
				: ""
		}

resource "aws_launch_template" "${service.name}_lt" {
  name_prefix   = "${options.projectName}-${service.name}-"
  image_id      = data.aws_ami.latest_amazon_linux.id
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.${service.name}_sg.id]

  user_data = base64encode(templatefile("./scripts/${service.name}-init.sh", {
    project_name = "${options.projectName}"
    service_name = "${service.name}"
    service_type = "${service.type}"
  }))

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"

    tags = {
      Name      = "${options.projectName}-${service.name}"
      Service   = "${service.name}"
      Type      = "${service.type}"
      ManagedBy = "xaheen-cli"
    }
  }
}
`;
	}

	private generateAWSApplicationAutoScaling(
		service: AutoScalingOptions["services"][0],
		options: AutoScalingOptions,
	): string {
		return `resource "aws_appautoscaling_target" "${service.name}_ecs_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${options.projectName}-cluster/${service.name}-service"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = ${service.minReplicas}
  max_capacity       = ${service.maxReplicas}
}

resource "aws_appautoscaling_policy" "${service.name}_ecs_cpu_policy" {
  name               = "${options.projectName}-${service.name}-cpu-autoscaling"
  service_namespace  = aws_appautoscaling_target.${service.name}_ecs_target.service_namespace
  resource_id        = aws_appautoscaling_target.${service.name}_ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.${service.name}_ecs_target.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = ${service.targetCPU}.0
    scale_in_cooldown  = ${this.parseTimeToSeconds(service.scaleDownDelay)}
    scale_out_cooldown = ${this.parseTimeToSeconds(service.scaleUpDelay)}
  }
}${
			service.targetMemory
				? `

resource "aws_appautoscaling_policy" "${service.name}_ecs_memory_policy" {
  name               = "${options.projectName}-${service.name}-memory-autoscaling"
  service_namespace  = aws_appautoscaling_target.${service.name}_ecs_target.service_namespace
  resource_id        = aws_appautoscaling_target.${service.name}_ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.${service.name}_ecs_target.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = ${service.targetMemory}.0
    scale_in_cooldown  = ${this.parseTimeToSeconds(service.scaleDownDelay)}
    scale_out_cooldown = ${this.parseTimeToSeconds(service.scaleUpDelay)}
  }
}`
				: ""
		}${
			service.targetRequestsPerSecond
				? `

resource "aws_appautoscaling_policy" "${service.name}_ecs_requests_policy" {
  name               = "${options.projectName}-${service.name}-requests-autoscaling"
  service_namespace  = aws_appautoscaling_target.${service.name}_ecs_target.service_namespace
  resource_id        = aws_appautoscaling_target.${service.name}_ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.${service.name}_ecs_target.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    customized_metric_specification {
      metric_name = "RequestCountPerTarget"
      namespace   = "AWS/ApplicationELB"
      statistic   = "Sum"
      
      dimensions {
        name  = "TargetGroup"
        value = aws_lb_target_group.${service.name}_tg.arn_suffix
      }
    }
    target_value       = ${service.targetRequestsPerSecond}.0
    scale_in_cooldown  = ${this.parseTimeToSeconds(service.scaleDownDelay)}
    scale_out_cooldown = ${this.parseTimeToSeconds(service.scaleUpDelay)}
  }
}`
				: ""
		}
`;
	}

	private generateAWSCloudWatch(options: AutoScalingOptions): string {
		const alarms = options.services
			.map(
				(service) => `
resource "aws_cloudwatch_metric_alarm" "${service.name}_high_cpu" {
  alarm_name          = "${options.projectName}-${service.name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "120"
  statistic           = "Average"
  threshold           = "${service.targetCPU + 10}"
  alarm_description   = "This metric monitors ${service.name} cpu utilization"
  alarm_actions       = [aws_sns_topic.autoscaling_alerts.arn]

  dimensions = {
    ServiceName = "${service.name}-service"
    ClusterName = "${options.projectName}-cluster"
  }
}

resource "aws_cloudwatch_metric_alarm" "${service.name}_low_cpu" {
  alarm_name          = "${options.projectName}-${service.name}-low-cpu"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "${Math.max(10, service.targetCPU - 20)}"
  alarm_description   = "This metric monitors ${service.name} low cpu utilization"
  alarm_actions       = [aws_sns_topic.autoscaling_alerts.arn]

  dimensions = {
    ServiceName = "${service.name}-service"
    ClusterName = "${options.projectName}-cluster"
  }
}`,
			)
			.join("\n");

		return `# CloudWatch Alarms for Auto Scaling
${alarms}

resource "aws_sns_topic" "autoscaling_alerts" {
  name = "${options.projectName}-autoscaling-alerts"
}

resource "aws_sns_topic_subscription" "autoscaling_alerts_email" {
  topic_arn = aws_sns_topic.autoscaling_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_dashboard" "autoscaling" {
  dashboard_name = "${options.projectName}-autoscaling"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ${options.services
							.map(
								(service) => `
            ["AWS/ECS", "CPUUtilization", { stat = "Average", label = "${service.name} CPU" }],
            [".", "MemoryUtilization", { stat = "Average", label = "${service.name} Memory" }],
            ["AWS/ApplicationELB", "RequestCountPerTarget", { stat = "Sum", label = "${service.name} Requests" }]`,
							)
							.join(",")}
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Service Metrics"
        }
      }
    ]
  })
}
`;
	}

	private async generateAzureManifests(
		options: AutoScalingOptions,
	): Promise<AutoScalingManifest[]> {
		const manifests: AutoScalingManifest[] = [];

		// Generate Azure Container Instances or AKS auto-scaling
		for (const service of options.services) {
			manifests.push({
				name: `${service.name}-autoscale.bicep`,
				content: this.generateAzureAutoScale(service, options),
				path: `bicep/autoscaling/${service.name}-autoscale.bicep`,
			});
		}

		// Generate Azure Monitor configuration
		manifests.push({
			name: "azure-monitor-autoscaling.bicep",
			content: this.generateAzureMonitor(options),
			path: "bicep/monitoring/azure-monitor-autoscaling.bicep",
		});

		return manifests;
	}

	private generateAzureAutoScale(
		service: AutoScalingOptions["services"][0],
		options: AutoScalingOptions,
	): string {
		return `param location string = resourceGroup().location
param projectName string = '${options.projectName}'
param serviceName string = '${service.name}'
param serviceType string = '${service.type}'

resource autoscaleSettings '${service.name}AutoscaleSettings' 'Microsoft.Insights/autoscaleSettings@2022-10-01' = {
  name: '\${projectName}-\${serviceName}-autoscale'
  location: location
  properties: {
    targetResourceUri: resourceId('Microsoft.ContainerInstance/containerGroups', '\${projectName}-\${serviceName}')
    enabled: true
    profiles: [
      {
        name: 'DefaultProfile'
        capacity: {
          minimum: '${service.minReplicas}'
          maximum: '${service.maxReplicas}'
          default: '${service.minReplicas}'
        }
        rules: [
          {
            metricTrigger: {
              metricName: 'CpuPercentage'
              metricResourceUri: resourceId('Microsoft.ContainerInstance/containerGroups', '\${projectName}-\${serviceName}')
              operator: 'GreaterThan'
              statistic: 'Average'
              threshold: ${service.targetCPU}
              timeAggregation: 'Average'
              timeGrain: 'PT1M'
              timeWindow: 'PT5M'
            }
            scaleAction: {
              direction: 'Increase'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT${service.scaleUpDelay}'
            }
          }
          {
            metricTrigger: {
              metricName: 'CpuPercentage'
              metricResourceUri: resourceId('Microsoft.ContainerInstance/containerGroups', '\${projectName}-\${serviceName}')
              operator: 'LessThan'
              statistic: 'Average'
              threshold: ${Math.max(10, service.targetCPU - 20)}
              timeAggregation: 'Average'
              timeGrain: 'PT1M'
              timeWindow: 'PT10M'
            }
            scaleAction: {
              direction: 'Decrease'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT${service.scaleDownDelay}'
            }
          }${
						service.targetMemory
							? `
          {
            metricTrigger: {
              metricName: 'MemoryPercentage'
              metricResourceUri: resourceId('Microsoft.ContainerInstance/containerGroups', '\${projectName}-\${serviceName}')
              operator: 'GreaterThan'
              statistic: 'Average'
              threshold: ${service.targetMemory}
              timeAggregation: 'Average'
              timeGrain: 'PT1M'
              timeWindow: 'PT5M'
            }
            scaleAction: {
              direction: 'Increase'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT${service.scaleUpDelay}'
            }
          }`
							: ""
					}
        ]
      }
    ]
    notifications: []
  }
}

output autoscaleId string = autoscaleSettings.id
output autoscaleName string = autoscaleSettings.name
`;
	}

	private generateAzureMonitor(options: AutoScalingOptions): string {
		return `param location string = resourceGroup().location
param projectName string = '${options.projectName}'

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '\${projectName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '\${projectName}-insights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: workspace.id
  }
}

${options.services
	.map(
		(service) => `
resource metricAlert${service.name} 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '\${projectName}-${service.name}-cpu-alert'
  location: 'global'
  properties: {
    description: 'Alert when CPU exceeds threshold for ${service.name}'
    severity: 2
    enabled: true
    scopes: [
      resourceId('Microsoft.ContainerInstance/containerGroups', '\${projectName}-${service.name}')
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighCPU'
          criterionType: 'StaticThresholdCriterion'
          metricName: 'CpuPercentage'
          dimensions: []
          operator: 'GreaterThan'
          threshold: ${service.targetCPU + 10}
          timeAggregation: 'Average'
        }
      ]
    }
    actions: []
  }
}`,
	)
	.join("\n")}

output workspaceId string = workspace.id
output appInsightsId string = appInsights.id
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
`;
	}

	private async generateGCPManifests(
		options: AutoScalingOptions,
	): Promise<AutoScalingManifest[]> {
		const manifests: AutoScalingManifest[] = [];

		// Generate GCP autoscaling configurations
		for (const service of options.services) {
			manifests.push({
				name: `${service.name}-autoscale.tf`,
				content: this.generateGCPAutoScale(service, options),
				path: `terraform/gcp/autoscaling/${service.name}-autoscale.tf`,
			});
		}

		return manifests;
	}

	private generateGCPAutoScale(
		service: AutoScalingOptions["services"][0],
		options: AutoScalingOptions,
	): string {
		return `resource "google_compute_autoscaler" "${service.name}_autoscaler" {
  name   = "${options.projectName}-${service.name}-autoscaler"
  zone   = var.zone
  target = google_compute_instance_group_manager.${service.name}_igm.id

  autoscaling_policy {
    max_replicas    = ${service.maxReplicas}
    min_replicas    = ${service.minReplicas}
    cooldown_period = ${this.parseTimeToSeconds(service.scaleDownDelay)}

    cpu_utilization {
      target = ${service.targetCPU / 100}
    }${
			service.targetRequestsPerSecond
				? `

    metric {
      name   = "compute.googleapis.com/instance/network/received_bytes_count"
      target = ${service.targetRequestsPerSecond}
      type   = "GAUGE"
    }`
				: ""
		}
  }
}

resource "google_compute_instance_group_manager" "${service.name}_igm" {
  name = "${options.projectName}-${service.name}-igm"
  zone = var.zone

  version {
    instance_template = google_compute_instance_template.${service.name}_template.id
    name              = "primary"
  }

  target_size = ${service.minReplicas}

  named_port {
    name = "http"
    port = 8080
  }

  auto_healing_policies {
    health_check      = google_compute_health_check.${service.name}_health.id
    initial_delay_sec = 300
  }
}

resource "google_compute_instance_template" "${service.name}_template" {
  name_prefix  = "${options.projectName}-${service.name}-"
  machine_type = var.machine_type
  region       = var.region

  disk {
    source_image = var.source_image
    auto_delete  = true
    boot         = true
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral IP
    }
  }

  metadata = {
    project-name = "${options.projectName}"
    service-name = "${service.name}"
    service-type = "${service.type}"
  }

  metadata_startup_script = file("./scripts/${service.name}-startup.sh")

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    service   = "${service.name}"
    type      = "${service.type}"
    managed-by = "xaheen-cli"
  }
}

resource "google_compute_health_check" "${service.name}_health" {
  name               = "${options.projectName}-${service.name}-health"
  check_interval_sec = 10
  timeout_sec        = 5

  http_health_check {
    port = 8080
    request_path = "${options.healthChecks?.livenessProbe?.path || "/health"}"
  }
}
`;
	}

	private async generateServerlessManifests(
		options: AutoScalingOptions,
	): Promise<AutoScalingManifest[]> {
		const manifests: AutoScalingManifest[] = [];

		// Generate serverless framework configuration
		manifests.push({
			name: "serverless.yml",
			content: this.generateServerlessConfig(options),
			path: "serverless.yml",
		});

		// Generate AWS SAM template for AWS Lambda
		manifests.push({
			name: "template.yaml",
			content: this.generateSAMTemplate(options),
			path: "sam/template.yaml",
		});

		// Generate Google Cloud Functions configuration
		manifests.push({
			name: "cloudfunctions.yaml",
			content: this.generateCloudFunctionsConfig(options),
			path: "gcp/cloudfunctions.yaml",
		});

		// Generate Azure Functions configuration
		manifests.push({
			name: "host.json",
			content: this.generateAzureFunctionsConfig(options),
			path: "azure-functions/host.json",
		});

		return manifests;
	}

	private generateServerlessConfig(options: AutoScalingOptions): string {
		const functions = options.services
			.filter((s) => s.type === "api" || s.type === "worker")
			.map(
				(service) => `  ${service.name}:
    handler: src/handlers/${service.name}.handler
    runtime: nodejs18.x
    memorySize: 1024
    timeout: 30
    reservedConcurrency: ${service.minReplicas}
    provisionedConcurrency: ${Math.floor(service.minReplicas / 2)}
    events:
      - httpApi:
          path: /${service.name}/{proxy+}
          method: ANY
    environment:
      SERVICE_NAME: ${service.name}
      SERVICE_TYPE: ${service.type}
      PROJECT_NAME: ${options.projectName}
    vpc:
      securityGroupIds:
        - \${self:custom.securityGroupId}
      subnetIds:
        - \${self:custom.subnetId1}
        - \${self:custom.subnetId2}
`,
			)
			.join("\n");

		return `service: ${options.projectName}

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-1'}
  
  tracing:
    lambda: true
    apiGateway: true

  logs:
    restApi:
      accessLogging: true
      executionLogging: true
      level: INFO
      fullExecutionData: true

  environment:
    STAGE: \${self:provider.stage}
    REGION: \${self:provider.region}
    PROJECT_NAME: ${options.projectName}

plugins:
  - serverless-plugin-aws-alerts
  - serverless-auto-scaling-plugin
  - serverless-plugin-tracing

custom:
  alerts:
    stages:
      - production
      - staging
    topics:
      alarm:
        topic: \${self:service}-\${self:provider.stage}-alerts-alarm
        notifications:
          - protocol: email
            endpoint: \${env:ALERT_EMAIL}
    alarms:
      - functionThrottles
      - functionErrors
      - functionDuration
      - functionConcurrentExecutions

  autoScaling:
    - name: \${self:service}-\${self:provider.stage}-scaling
      enabled: true
      minimum: ${Math.min(...options.services.map((s) => s.minReplicas))}
      maximum: ${Math.max(...options.services.map((s) => s.maxReplicas))}
      targetUsage: ${Math.min(...options.services.map((s) => s.targetCPU))}
      scaleInCooldown: 300
      scaleOutCooldown: 30

functions:
${functions}

resources:
  Resources:
    ApplicationAutoScalingTarget:
      Type: AWS::ApplicationAutoScaling::ScalableTarget
      Properties:
        MaxCapacity: ${Math.max(...options.services.map((s) => s.maxReplicas))}
        MinCapacity: ${Math.min(...options.services.map((s) => s.minReplicas))}
        ResourceId: function:\${self:service}-\${self:provider.stage}-*
        RoleARN: !Sub arn:aws:iam::\${AWS::AccountId}:role/aws-service-role/lambda.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_LambdaConcurrency
        ScalableDimension: lambda:function:ProvisionedConcurrencyUtilization
        ServiceNamespace: lambda

    ApplicationAutoScalingPolicy:
      Type: AWS::ApplicationAutoScaling::ScalingPolicy
      Properties:
        PolicyName: \${self:service}-\${self:provider.stage}-autoscaling-policy
        PolicyType: TargetTrackingScaling
        ScalingTargetId: !Ref ApplicationAutoScalingTarget
        TargetTrackingScalingPolicyConfiguration:
          PredefinedMetricSpecification:
            PredefinedMetricType: LambdaProvisionedConcurrencyUtilization
          TargetValue: ${Math.min(...options.services.map((s) => s.targetCPU))}
`;
	}

	private generateSAMTemplate(options: AutoScalingOptions): string {
		const functions = options.services
			.filter((s) => s.type === "api" || s.type === "worker")
			.map(
				(service) => `  ${service.name}Function:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: ${options.projectName}-${service.name}
      CodeUri: ./src/handlers/
      Handler: ${service.name}.handler
      Runtime: nodejs18.x
      MemorySize: 1024
      Timeout: 30
      ReservedConcurrentExecutions: ${service.maxReplicas * 10}
      ProvisionedConcurrencyConfig:
        ProvisionedConcurrentExecutions: ${service.minReplicas}
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent5Minutes
        Alarms:
          - !Ref ${service.name}ErrorsAlarm
      Environment:
        Variables:
          SERVICE_NAME: ${service.name}
          SERVICE_TYPE: ${service.type}
          PROJECT_NAME: ${options.projectName}
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /${service.name}/{proxy+}
            Method: ANY
      Tracing: Active

  ${service.name}ErrorsAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ${options.projectName}-${service.name}-errors
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 60
      EvaluationPeriods: 2
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: FunctionName
          Value: !Ref ${service.name}Function
`,
			)
			.join("\n\n");

		return `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Description: ${options.projectName} Serverless Application

Globals:
  Function:
    Timeout: 30
    MemorySize: 1024
    Tracing: Active
    Environment:
      Variables:
        PROJECT_NAME: ${options.projectName}
    Tags:
      Project: ${options.projectName}
      ManagedBy: xaheen-cli

Parameters:
  Stage:
    Type: String
    Default: dev
    AllowedValues:
      - dev
      - staging
      - production

Resources:
${functions}

  ApplicationAutoScalingRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - application-autoscaling.amazonaws.com
            Action:
              - 'sts:AssumeRole'
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaRole
      Policies:
        - PolicyName: LambdaScalingPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - lambda:UpdateAlias
                  - lambda:GetAlias
                  - lambda:PutProvisionedConcurrencyConfig
                  - lambda:GetProvisionedConcurrencyConfig
                  - lambda:DeleteProvisionedConcurrencyConfig
                Resource: '*'

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://\${ServerlessHttpApi}.execute-api.\${AWS::Region}.amazonaws.com'
`;
	}

	private generateCloudFunctionsConfig(options: AutoScalingOptions): string {
		const functions = options.services
			.filter((s) => s.type === "api" || s.type === "worker")
			.map(
				(service) => `- name: ${options.projectName}-${service.name}
  source: ./functions/${service.name}
  entry_point: handler
  runtime: nodejs18
  trigger:
    type: http
    security_level: secure_always
  memory: 1024MB
  timeout: 30s
  min_instances: ${service.minReplicas}
  max_instances: ${service.maxReplicas}
  environment_variables:
    SERVICE_NAME: ${service.name}
    SERVICE_TYPE: ${service.type}
    PROJECT_NAME: ${options.projectName}
  vpc_connector: projects/${options.projectName}/locations/\${region}/connectors/\${vpc_connector}
  ingress_settings: ALLOW_ALL
  labels:
    service: ${service.name}
    type: ${service.type}
    managed-by: xaheen-cli
`,
			)
			.join("\n");

		return `# Google Cloud Functions Configuration
# Generated by Xaheen CLI

project: ${options.projectName}
region: us-central1

functions:
${functions}

# Cloud Run integration for container-based functions
cloud_run:
  cpu: 2
  memory: 2Gi
  concurrency: 100
  timeout: 300s
  service_account: ${options.projectName}-functions@\${project_id}.iam.gserviceaccount.com

# Auto-scaling configuration
autoscaling:
  min_instances: ${Math.min(...options.services.map((s) => s.minReplicas))}
  max_instances: ${Math.max(...options.services.map((s) => s.maxReplicas))}
  target_cpu_utilization: ${Math.min(...options.services.map((s) => s.targetCPU)) / 100}
  target_request_latency: 500ms

# Monitoring and alerting
monitoring:
  enabled: true
  alert_policies:
    - display_name: High Error Rate
      conditions:
        - display_name: Error rate above 1%
          threshold_value: 0.01
          comparison: COMPARISON_GT
    - display_name: High Latency
      conditions:
        - display_name: P95 latency above 1s
          threshold_value: 1000
          comparison: COMPARISON_GT
`;
	}

	private generateAzureFunctionsConfig(options: AutoScalingOptions): string {
		return `{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[3.*, 4.0.0)"
  },
  "functionTimeout": "00:00:30",
  "healthMonitor": {
    "enabled": true,
    "healthCheckInterval": "00:00:10",
    "healthCheckWindow": "00:01:00",
    "healthCheckThreshold": 3,
    "counterThreshold": 0.80
  },
  "extensions": {
    "http": {
      "routePrefix": "api",
      "maxOutstandingRequests": 200,
      "maxConcurrentRequests": 100,
      "dynamicThrottlesEnabled": true
    },
    "queues": {
      "maxPollingInterval": "00:00:02",
      "visibilityTimeout": "00:00:30",
      "batchSize": 16,
      "maxDequeueCount": 5,
      "newBatchThreshold": 8
    }
  },
  "concurrency": {
    "dynamicConcurrencyEnabled": true,
    "snapshotPersistenceEnabled": true
  },
  "customHandler": {
    "description": {
      "defaultExecutablePath": "handler",
      "workingDirectory": "",
      "arguments": []
    },
    "enableForwardingHttpRequest": false
  },
  "retry": {
    "strategy": "exponentialBackoff",
    "maxRetryCount": 5,
    "minimumInterval": "00:00:05",
    "maximumInterval": "00:01:00"
  },
  "scale": {
    "maxConcurrentActivityFunctions": ${Math.max(...options.services.map((s) => s.maxReplicas)) * 10},
    "maxConcurrentOrchestratorFunctions": ${Math.max(...options.services.map((s) => s.maxReplicas))},
    "runtimeScaleMonitoringEnabled": true
  },
  "singleton": {
    "lockPeriod": "00:00:15",
    "listenerLockPeriod": "00:01:00",
    "listenerLockRecoveryPollingInterval": "00:01:00",
    "lockAcquisitionTimeout": "00:01:00",
    "lockAcquisitionPollingInterval": "00:00:03"
  },
  "managedDependency": {
    "enabled": true
  },
  "applicationInsights": {
    "connectionString": "\${APPLICATIONINSIGHTS_CONNECTION_STRING}"
  }
}`;
	}

	private async generateMonitoringConfig(
		options: AutoScalingOptions,
	): Promise<void> {
		const monitoringPath = path.join(options.projectPath, "monitoring");
		await fs.mkdir(monitoringPath, { recursive: true });

		// Generate Prometheus configuration for metrics
		if (
			options.metrics?.provider === "prometheus" ||
			!options.metrics?.provider
		) {
			const prometheusConfig = `global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - "autoscaling_rules.yml"

scrape_configs:
${options.services
	.map(
		(service) => `  - job_name: '${service.name}'
    static_configs:
      - targets: ['${service.name}:9090']
    relabel_configs:
      - source_labels: [__address__]
        target_label: service
        replacement: ${service.name}
      - source_labels: [__address__]
        target_label: type
        replacement: ${service.type}`,
	)
	.join("\n")}
`;

			await fs.writeFile(
				path.join(monitoringPath, "prometheus.yml"),
				prometheusConfig,
			);

			// Generate auto-scaling rules
			const autoscalingRules = `groups:
  - name: autoscaling
    interval: 30s
    rules:
${options.services
	.map(
		(service) => `      - alert: ${service.name}_high_cpu
        expr: rate(container_cpu_usage_seconds_total{service="${service.name}"}[5m]) * 100 > ${service.targetCPU}
        for: 2m
        labels:
          severity: warning
          service: ${service.name}
        annotations:
          summary: "High CPU usage for ${service.name}"
          description: "CPU usage is above ${service.targetCPU}% for ${service.name}"
      
      - alert: ${service.name}_low_cpu
        expr: rate(container_cpu_usage_seconds_total{service="${service.name}"}[5m]) * 100 < ${Math.max(10, service.targetCPU - 30)}
        for: 10m
        labels:
          severity: info
          service: ${service.name}
        annotations:
          summary: "Low CPU usage for ${service.name}"
          description: "CPU usage is below ${Math.max(10, service.targetCPU - 30)}% for ${service.name}, consider scaling down"${
						service.targetMemory
							? `
      
      - alert: ${service.name}_high_memory
        expr: container_memory_usage_bytes{service="${service.name}"} / container_spec_memory_limit_bytes * 100 > ${service.targetMemory}
        for: 2m
        labels:
          severity: warning
          service: ${service.name}
        annotations:
          summary: "High memory usage for ${service.name}"
          description: "Memory usage is above ${service.targetMemory}% for ${service.name}"`
							: ""
					}`,
	)
	.join("\n")}
`;

			await fs.writeFile(
				path.join(monitoringPath, "autoscaling_rules.yml"),
				autoscalingRules,
			);
		}

		// Generate custom metrics configuration
		if (options.metrics?.customMetrics) {
			const customMetricsConfig = {
				metrics: options.metrics.customMetrics.map((metric) => ({
					name: metric.name,
					query: metric.query,
					threshold: metric.threshold,
					evaluation_interval: "30s",
					aggregation: "avg",
				})),
				exporters: [
					{
						type: options.metrics.provider || "prometheus",
						endpoint: `http://${options.metrics.provider || "prometheus"}:9090/metrics`,
					},
				],
			};

			await fs.writeFile(
				path.join(monitoringPath, "custom-metrics.json"),
				JSON.stringify(customMetricsConfig, null, 2),
			);
		}
	}

	private async generateCostOptimizationConfig(
		options: AutoScalingOptions,
	): Promise<void> {
		const costPath = path.join(options.projectPath, "cost-optimization");
		await fs.mkdir(costPath, { recursive: true });

		// Generate spot instance configuration
		if (options.costOptimization?.spotInstances) {
			const spotConfig = {
				enabled: true,
				strategy: "lowest-price",
				instance_pools: 3,
				on_demand_base_capacity: Math.min(
					...options.services.map((s) => s.minReplicas),
				),
				on_demand_percentage_above_base: 25,
				spot_allocation_strategy: "capacity-optimized",
				spot_instance_interruption_behavior: "terminate",
				services: options.services.map((service) => ({
					name: service.name,
					spot_max_price: "auto",
					fallback_to_on_demand: true,
				})),
			};

			await fs.writeFile(
				path.join(costPath, "spot-instances.json"),
				JSON.stringify(spotConfig, null, 2),
			);
		}

		// Generate scheduled scaling configuration
		if (options.costOptimization?.scheduledScaling) {
			const scheduledScalingConfig = {
				schedules: options.costOptimization.scheduledScaling.map(
					(schedule) => ({
						name: schedule.name,
						cron: schedule.schedule,
						min_replicas: schedule.minReplicas,
						max_replicas: schedule.maxReplicas,
						timezone: "UTC",
						services: options.services.map((s) => s.name),
					}),
				),
			};

			await fs.writeFile(
				path.join(costPath, "scheduled-scaling.json"),
				JSON.stringify(scheduledScalingConfig, null, 2),
			);

			// Generate cron job manifest for Kubernetes
			if (options.provider === "kubernetes") {
				const cronJobManifest = options.costOptimization.scheduledScaling
					.map(
						(schedule) => `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${schedule.name}-scaling
  namespace: ${options.projectName}
spec:
  schedule: "${schedule.schedule}"
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: autoscaler
          containers:
          - name: kubectl
            image: bitnami/kubectl:latest
            command:
            - /bin/sh
            - -c
            - |
              ${options.services
								.map(
									(service) =>
										`kubectl patch hpa ${service.name}-hpa -n ${options.projectName} --patch '{"spec":{"minReplicas":${schedule.minReplicas},"maxReplicas":${schedule.maxReplicas}}}'`,
								)
								.join("\n              ")}
          restartPolicy: OnFailure
`,
					)
					.join("---\n");

				await fs.writeFile(
					path.join(costPath, "scheduled-scaling-cronjobs.yaml"),
					cronJobManifest,
				);
			}
		}

		// Generate cost monitoring dashboard configuration
		const costDashboard = {
			name: `${options.projectName}-cost-optimization`,
			refresh: "5m",
			panels: [
				{
					title: "Estimated Monthly Cost",
					type: "stat",
					query: "sum(instance_cost_per_hour) * 24 * 30",
				},
				{
					title: "Cost by Service",
					type: "pie",
					query: "sum by (service) (instance_cost_per_hour)",
				},
				{
					title: "Spot vs On-Demand Usage",
					type: "timeseries",
					queries: [
						"count(instance_type='spot')",
						"count(instance_type='on-demand')",
					],
				},
				{
					title: "Resource Utilization vs Cost",
					type: "scatter",
					x_axis: "avg(cpu_utilization)",
					y_axis: "sum(instance_cost_per_hour)",
				},
			],
		};

		await fs.writeFile(
			path.join(costPath, "cost-dashboard.json"),
			JSON.stringify(costDashboard, null, 2),
		);
	}

	private async writeManifests(
		manifests: AutoScalingManifest[],
		projectPath: string,
	): Promise<void> {
		for (const manifest of manifests) {
			const filePath = path.join(projectPath, manifest.path);
			const dir = path.dirname(filePath);

			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(filePath, manifest.content);

			console.log(chalk.gray(`  Created: ${manifest.path}`));
		}
	}

	private parseTimeToSeconds(time: string): number {
		const match = time.match(/^(\d+)([smh])$/);
		if (!match) return 300; // Default to 5 minutes

		const value = parseInt(match[1]);
		const unit = match[2];

		switch (unit) {
			case "s":
				return value;
			case "m":
				return value * 60;
			case "h":
				return value * 3600;
			default:
				return 300;
		}
	}
}

// Export factory function
export function createAutoScalingGenerator(): AutoScalingGenerator {
	return new AutoScalingGenerator();
}
