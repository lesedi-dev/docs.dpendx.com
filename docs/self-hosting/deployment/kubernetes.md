---
sidebar_position: 3
---

# Kubernetes Deployment

Deploy dpendx on Kubernetes for production-grade scalability and reliability.

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- [GitHub App created](/self-hosting/github-app-setup)
- Helm 3 (optional)

## Quick Start

### Create Namespace

```bash
kubectl create namespace dpendx
```

### Create Secret

```bash
kubectl create secret generic dpendx-secrets \
  --namespace dpendx \
  --from-literal=GITHUB_APP_ID=123456 \
  --from-literal=GITHUB_PRIVATE_KEY='LS0tLS1CRUdJTi...' \
  --from-literal=GITHUB_WEBHOOK_SECRET='your_secret_here'
```

### Apply Manifests

```bash
kubectl apply -f https://raw.githubusercontent.com/dpendx/dpendx/main/deploy/kubernetes/
```

## Kubernetes Manifests

### Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dpendx
  namespace: dpendx
  labels:
    app: dpendx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dpendx
  template:
    metadata:
      labels:
        app: dpendx
    spec:
      serviceAccountName: dpendx
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: dpendx
          image: ghcr.io/dpendx/dpendx:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
              name: http
          env:
            - name: PORT
              value: "8080"
            - name: GITHUB_APP_ID
              valueFrom:
                secretKeyRef:
                  name: dpendx-secrets
                  key: GITHUB_APP_ID
            - name: GITHUB_PRIVATE_KEY
              valueFrom:
                secretKeyRef:
                  name: dpendx-secrets
                  key: GITHUB_PRIVATE_KEY
            - name: GITHUB_WEBHOOK_SECRET
              valueFrom:
                secretKeyRef:
                  name: dpendx-secrets
                  key: GITHUB_WEBHOOK_SECRET
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
```

### Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: dpendx
  namespace: dpendx
  labels:
    app: dpendx
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app: dpendx
```

### Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dpendx
  namespace: dpendx
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - dpendx.yourcompany.com
      secretName: dpendx-tls
  rules:
    - host: dpendx.yourcompany.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: dpendx
                port:
                  number: 80
```

### ServiceAccount

```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dpendx
  namespace: dpendx
```

### HorizontalPodAutoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dpendx
  namespace: dpendx
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dpendx
  minReplicas: 2
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
```

### PodDisruptionBudget

```yaml
# pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: dpendx
  namespace: dpendx
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: dpendx
```

## With PostgreSQL

### PostgreSQL StatefulSet

```yaml
# postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: dpendx
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          env:
            - name: POSTGRES_USER
              value: dpendx
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secrets
                  key: password
            - name: POSTGRES_DB
              value: dpendx
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: dpendx
spec:
  ports:
    - port: 5432
  selector:
    app: postgres
```

### Update dpendx Deployment

Add the database URL environment variable:

```yaml
env:
  - name: DATABASE_URL
    value: postgres://dpendx:$(POSTGRES_PASSWORD)@postgres:5432/dpendx?sslmode=disable
  - name: POSTGRES_PASSWORD
    valueFrom:
      secretKeyRef:
        name: postgres-secrets
        key: password
```

## Helm Chart

### Install with Helm

```bash
helm repo add dpendx https://dpendx.github.io/charts
helm install dpendx dpendx/dpendx \
  --namespace dpendx \
  --create-namespace \
  --set github.appId=123456 \
  --set github.privateKey=LS0tLS1CRUdJTi... \
  --set github.webhookSecret=your_secret
```

### values.yaml

```yaml
# values.yaml
replicaCount: 2

image:
  repository: ghcr.io/dpendx/dpendx
  tag: latest
  pullPolicy: Always

github:
  appId: "123456"
  privateKey: "LS0tLS1CRUdJTi..."
  webhookSecret: "your_secret"

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: dpendx.yourcompany.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: dpendx-tls
      hosts:
        - dpendx.yourcompany.com

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

postgresql:
  enabled: false  # Set to true for persistence
  auth:
    database: dpendx
    username: dpendx
```

## Network Policies

### Restrict Network Access

```yaml
# networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: dpendx
  namespace: dpendx
spec:
  podSelector:
    matchLabels:
      app: dpendx
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - port: 8080
  egress:
    # GitHub API
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - port: 443
    # PostgreSQL
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - port: 5432
    # DNS
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - port: 53
          protocol: UDP
```

## Monitoring

### ServiceMonitor (Prometheus Operator)

```yaml
# servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: dpendx
  namespace: dpendx
spec:
  selector:
    matchLabels:
      app: dpendx
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

### PrometheusRule

```yaml
# prometheusrule.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: dpendx
  namespace: dpendx
spec:
  groups:
    - name: dpendx
      rules:
        - alert: DpendxDown
          expr: up{job="dpendx"} == 0
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: dpendx is down
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n dpendx
kubectl describe pod <pod-name> -n dpendx
```

### View Logs

```bash
kubectl logs -f deployment/dpendx -n dpendx
```

### Test Connectivity

```bash
kubectl run -it --rm debug --image=alpine --restart=Never -- \
  wget -q --spider https://api.github.com
```

### Check Secrets

```bash
kubectl get secrets -n dpendx
kubectl describe secret dpendx-secrets -n dpendx
```

## Next Steps

- [Configure database](/self-hosting/database-setup)
- [View all environment variables](/self-hosting/environment-variables)
- [Troubleshoot common issues](/troubleshooting/common-issues)
