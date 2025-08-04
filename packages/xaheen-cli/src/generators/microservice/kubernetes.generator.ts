/**
 * Kubernetes Generator
 * Generates Kubernetes manifests for microservice deployment
 */

import type { GeneratedFile, MicroserviceOptions } from "./types.js";

export class KubernetesGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Generate namespace
		files.push(this.generateNamespace(options));

		// Generate deployment
		files.push(this.generateDeployment(options));

		// Generate service
		files.push(this.generateService(options));

		// Generate configmap
		files.push(this.generateConfigMap(options));

		// Generate secret
		files.push(this.generateSecret(options));

		// Generate ingress
		files.push(this.generateIngress(options));

		// Generate HPA
		files.push(this.generateHPA(options));

		// Generate network policy
		files.push(this.generateNetworkPolicy(options));

		return files;
	}

	private generateNamespace(options: MicroserviceOptions): GeneratedFile {
		const content = `apiVersion: v1
kind: Namespace
metadata:
  name: ${options.name}
  labels:
    name: ${options.name}
    environment: production`;

		return {
			path: `${options.name}/k8s/namespace.yaml`,
			content,
			type: "kubernetes",
		};
	}

	private generateDeployment(options: MicroserviceOptions): GeneratedFile {
		const content = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${options.name}
  namespace: ${options.name}
  labels:
    app: ${options.name}
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${options.name}
  template:
    metadata:
      labels:
        app: ${options.name}
        version: v1
      annotations:
        prometheus.io/scrape: "${options.features.includes("metrics")}"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: ${options.name}
      containers:
      - name: ${options.name}
        image: ${options.name}:latest
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        ${
					options.features.includes("health-checks")
						? `- name: health
          containerPort: 8081
          protocol: TCP`
						: ""
				}
        ${
					options.features.includes("metrics")
						? `- name: metrics
          containerPort: 9090
          protocol: TCP`
						: ""
				}
        ${
					options.features.includes("grpc")
						? `- name: grpc
          containerPort: 50051
          protocol: TCP`
						: ""
				}
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: SERVICE_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        envFrom:
        - configMapRef:
            name: ${options.name}-config
        - secretRef:
            name: ${options.name}-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        ${
					options.features.includes("health-checks")
						? `livenessProbe:
          httpGet:
            path: /health/liveness
            port: health
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: health
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health/startup
            port: health
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30`
						: ""
				}
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: ${options.name}-config
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - ${options.name}
              topologyKey: kubernetes.io/hostname`;

		return {
			path: `${options.name}/k8s/deployment.yaml`,
			content,
			type: "kubernetes",
		};
	}

	private generateService(options: MicroserviceOptions): GeneratedFile {
		const content = `apiVersion: v1
kind: Service
metadata:
  name: ${options.name}
  namespace: ${options.name}
  labels:
    app: ${options.name}
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: ClusterIP
  selector:
    app: ${options.name}
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  ${
		options.features.includes("health-checks")
			? `- name: health
    port: 8081
    targetPort: 8081
    protocol: TCP`
			: ""
	}
  ${
		options.features.includes("metrics")
			? `- name: metrics
    port: 9090
    targetPort: 9090
    protocol: TCP`
			: ""
	}
  ${
		options.features.includes("grpc")
			? `- name: grpc
    port: 50051
    targetPort: 50051
    protocol: TCP`
			: ""
	}
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800`;

		return {
			path: `${options.name}/k8s/service.yaml`,
			content,
			type: "kubernetes",
		};
	}

	private generateConfigMap(options: MicroserviceOptions): GeneratedFile {
		const configData: Record<string, string> = {
			LOG_LEVEL: "info",
			CORS_ORIGIN: "*",
		};

		if (options.database === "postgresql") {
			configData.DATABASE_HOST = "postgres-service";
			configData.DATABASE_PORT = "5432";
			configData.DATABASE_NAME = `${options.name}_db`;
		} else if (options.database === "mongodb") {
			configData.MONGODB_HOST = "mongodb-service";
			configData.MONGODB_PORT = "27017";
		} else if (options.database === "redis") {
			configData.REDIS_HOST = "redis-service";
			configData.REDIS_PORT = "6379";
		}

		if (options.messaging === "rabbitmq") {
			configData.RABBITMQ_HOST = "rabbitmq-service";
			configData.RABBITMQ_PORT = "5672";
		} else if (options.messaging === "kafka") {
			configData.KAFKA_BROKERS = "kafka-service:9092";
		}

		if (options.tracing) {
			configData.JAEGER_ENDPOINT = "http://jaeger-collector:14268/api/traces";
			configData.TRACING_SAMPLE_RATE = "0.1";
		}

		const content = `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${options.name}-config
  namespace: ${options.name}
data:
${Object.entries(configData)
	.map(([key, value]) => `  ${key}: "${value}"`)
	.join("\n")}`;

		return {
			path: `${options.name}/k8s/configmap.yaml`,
			content,
			type: "kubernetes",
		};
	}

	private generateSecret(options: MicroserviceOptions): GeneratedFile {
		const content = `apiVersion: v1
kind: Secret
metadata:
  name: ${options.name}-secret
  namespace: ${options.name}
type: Opaque
stringData:
  DATABASE_PASSWORD: "changeme"
  ${options.authentication === "jwt" ? 'JWT_SECRET: "your-secret-key-change-this"' : ""}
  ${options.messaging === "rabbitmq" ? 'RABBITMQ_PASSWORD: "changeme"' : ""}
  ${options.database === "redis" ? 'REDIS_PASSWORD: ""' : ""}`;

		return {
			path: `${options.name}/k8s/secret.yaml`,
			content,
			type: "kubernetes",
		};
	}

	private generateIngress(options: MicroserviceOptions): GeneratedFile {
		const content = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${options.name}
  namespace: ${options.name}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    ${
			options.features.includes("rate-limiting")
				? `nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-rpm: "1000"`
				: ""
		}
    ${options.features.includes("grpc") ? 'nginx.ingress.kubernetes.io/backend-protocol: "GRPC"' : ""}
spec:
  tls:
  - hosts:
    - ${options.name}.example.com
    secretName: ${options.name}-tls
  rules:
  - host: ${options.name}.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${options.name}
            port:
              number: 80`;

		return {
			path: `${options.name}/k8s/ingress.yaml`,
			content,
			type: "kubernetes",
		};
	}

	private generateHPA(options: MicroserviceOptions): GeneratedFile {
		const content = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${options.name}
  namespace: ${options.name}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${options.name}
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max`;

		return {
			path: `${options.name}/k8s/hpa.yaml`,
			content,
			type: "kubernetes",
		};
	}

	private generateNetworkPolicy(options: MicroserviceOptions): GeneratedFile {
		const content = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${options.name}
  namespace: ${options.name}
spec:
  podSelector:
    matchLabels:
      app: ${options.name}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: ${options.name}
    ports:
    - protocol: TCP
      port: 3000
    ${
			options.features.includes("health-checks")
				? `- protocol: TCP
      port: 8081`
				: ""
		}
    ${
			options.features.includes("metrics")
				? `- protocol: TCP
      port: 9090`
				: ""
		}
    ${
			options.features.includes("grpc")
				? `- protocol: TCP
      port: 50051`
				: ""
		}
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  - to:
    - namespaceSelector:
        matchLabels:
          name: ${options.name}
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 27017 # MongoDB
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 5672  # RabbitMQ
    - protocol: TCP
      port: 9092  # Kafka`;

		return {
			path: `${options.name}/k8s/network-policy.yaml`,
			content,
			type: "kubernetes",
		};
	}
}
