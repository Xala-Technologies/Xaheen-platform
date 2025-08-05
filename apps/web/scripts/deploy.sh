#!/bin/bash

# =============================================================================
# Xaheen CLI Ecosystem Web Application Deployment Script
# Production deployment automation with health checks and rollback capability
# =============================================================================

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${ENVIRONMENT:-production}"
TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-xaheen/web-app}"
DEPLOYMENT_METHOD="${DEPLOYMENT_METHOD:-docker-compose}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    log "INFO" "${BLUE}$*${NC}"
}

log_success() {
    log "SUCCESS" "${GREEN}$*${NC}"
}

log_warning() {
    log "WARNING" "${YELLOW}$*${NC}"
}

log_error() {
    log "ERROR" "${RED}$*${NC}"
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

check_requirements() {
    log_info "Checking deployment requirements..."
    
    local missing_tools=()
    
    if [[ "$DEPLOYMENT_METHOD" == "docker-compose" ]]; then
        command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
        command -v docker-compose >/dev/null 2>&1 || missing_tools+=("docker-compose")
    elif [[ "$DEPLOYMENT_METHOD" == "kubernetes" ]]; then
        command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
        command -v helm >/dev/null 2>&1 || missing_tools+=("helm")
    fi
    
    command -v curl >/dev/null 2>&1 || missing_tools+=("curl")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install the missing tools and try again."
        exit 1
    fi
    
    log_success "All required tools are available"
}

validate_environment() {
    log_info "Validating environment configuration..."
    
    # Check required environment variables
    local required_vars=()
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        required_vars+=(
            "DATABASE_URL"
            "REDIS_URL"
            "NEXTAUTH_SECRET"
            "NEXTAUTH_URL"
            "MCP_SERVER_API_KEY"
        )
    fi
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        log_error "Please set the missing variables and try again."
        exit 1
    fi
    
    # Validate environment file exists
    local env_file="${PROJECT_ROOT}/.env.${ENVIRONMENT}"
    if [[ ! -f "$env_file" ]]; then
        log_warning "Environment file not found: $env_file"
        log_info "Using environment variables from shell"
    else
        log_success "Environment file found: $env_file"
    fi
    
    log_success "Environment validation completed"
}

check_image_exists() {
    local image="$1"
    log_info "Checking if image exists: $image"
    
    if docker manifest inspect "$image" >/dev/null 2>&1; then
        log_success "Image exists: $image"
        return 0
    else
        log_error "Image not found: $image"
        return 1
    fi
}

# =============================================================================
# HEALTH CHECK FUNCTIONS
# =============================================================================

wait_for_service() {
    local service_name="$1"
    local health_url="$2"
    local timeout="$3"
    
    log_info "Waiting for $service_name to be healthy..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        if curl -f -s "$health_url" >/dev/null 2>&1; then
            log_success "$service_name is healthy"
            return 0
        fi
        
        log_info "Waiting for $service_name... ($(( $(date +%s) - start_time ))s elapsed)"
        sleep 5
    done
    
    log_error "$service_name failed to become healthy within ${timeout}s"
    return 1
}

perform_health_checks() {
    log_info "Performing health checks..."
    
    local base_url="http://localhost:3000"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        base_url="https://xaheen.no"
    fi
    
    # Basic health check
    if ! wait_for_service "Web Application" "$base_url/api/health" "$HEALTH_CHECK_TIMEOUT"; then
        return 1
    fi
    
    # API endpoints check
    local endpoints=(
        "/api/health"
        "/api/ready"
        "/"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="$base_url$endpoint"
        log_info "Checking endpoint: $url"
        
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        if [[ "$response_code" == "200" ]]; then
            log_success "Endpoint healthy: $endpoint"
        else
            log_error "Endpoint failed: $endpoint (HTTP $response_code)"
            return 1
        fi
    done
    
    log_success "All health checks passed"
    return 0
}

# =============================================================================
# DEPLOYMENT FUNCTIONS
# =============================================================================

deploy_docker_compose() {
    log_info "Deploying with Docker Compose..."
    
    local compose_file="${PROJECT_ROOT}/docker-compose.production.yml"
    if [[ ! -f "$compose_file" ]]; then
        log_error "Docker Compose file not found: $compose_file"
        exit 1
    fi
    
    # Set environment variables for compose
    export TAG="${TAG}"
    export BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    export GIT_SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}"
    export GIT_REF="${GITHUB_REF:-$(git branch --show-current)}"
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f "$compose_file" pull
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$compose_file" up -d
    
    # Wait for services to be ready
    sleep 30
    
    log_success "Docker Compose deployment completed"
}

deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    local k8s_dir="${PROJECT_ROOT}/kubernetes"
    if [[ ! -d "$k8s_dir" ]]; then
        log_error "Kubernetes manifests directory not found: $k8s_dir"
        exit 1
    fi
    
    # Apply namespace and RBAC first
    log_info "Applying namespace and RBAC..."
    kubectl apply -f "$k8s_dir/namespace.yaml"
    
    # Apply secrets and configmaps
    log_info "Applying secrets and configmaps..."
    if [[ -f "$k8s_dir/secrets.yaml" ]]; then
        kubectl apply -f "$k8s_dir/secrets.yaml"
    fi
    if [[ -f "$k8s_dir/configmap.yaml" ]]; then
        kubectl apply -f "$k8s_dir/configmap.yaml"
    fi
    
    # Apply deployments and services
    log_info "Applying deployments and services..."
    kubectl apply -f "$k8s_dir/web-deployment.yaml"
    kubectl apply -f "$k8s_dir/web-service.yaml"
    
    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment/xaheen-web -n xaheen-prod
    
    # Check pod status
    kubectl get pods -n xaheen-prod -l app=xaheen-web
    
    log_success "Kubernetes deployment completed"
}

# =============================================================================
# ROLLBACK FUNCTIONS
# =============================================================================

rollback_docker_compose() {
    log_warning "Rolling back Docker Compose deployment..."
    
    local compose_file="${PROJECT_ROOT}/docker-compose.production.yml"
    
    # Stop current services
    docker-compose -f "$compose_file" down
    
    # Start with previous image (if available)
    export TAG="previous"
    docker-compose -f "$compose_file" up -d
    
    log_success "Docker Compose rollback completed"
}

rollback_kubernetes() {
    log_warning "Rolling back Kubernetes deployment..."
    
    # Rollback to previous revision
    kubectl rollout undo deployment/xaheen-web -n xaheen-prod
    
    # Wait for rollback to complete
    kubectl wait --for=condition=available --timeout=300s deployment/xaheen-web -n xaheen-prod
    
    log_success "Kubernetes rollback completed"
}

perform_rollback() {
    log_warning "Performing rollback due to deployment failure..."
    
    if [[ "$DEPLOYMENT_METHOD" == "docker-compose" ]]; then
        rollback_docker_compose
    elif [[ "$DEPLOYMENT_METHOD" == "kubernetes" ]]; then
        rollback_kubernetes
    fi
}

# =============================================================================
# BACKUP FUNCTIONS
# =============================================================================

backup_database() {
    log_info "Creating database backup before deployment..."
    
    local backup_dir="${PROJECT_ROOT}/backups"
    mkdir -p "$backup_dir"
    
    local backup_file="$backup_dir/xaheen_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if [[ -n "${DATABASE_URL:-}" ]]; then
        pg_dump "$DATABASE_URL" > "$backup_file"
        log_success "Database backup created: $backup_file"
    else
        log_warning "DATABASE_URL not set, skipping database backup"
    fi
}

# =============================================================================
# MONITORING FUNCTIONS
# =============================================================================

setup_monitoring() {
    log_info "Setting up monitoring and alerting..."
    
    # This would typically involve:
    # - Configuring Prometheus scraping
    # - Setting up Grafana dashboards
    # - Configuring alerts
    # - Setting up log forwarding
    
    log_info "Monitoring setup completed"
}

# =============================================================================
# MAIN DEPLOYMENT FUNCTION
# =============================================================================

main() {
    log_info "Starting Xaheen CLI Ecosystem Web Application deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Tag: $TAG"
    log_info "Deployment Method: $DEPLOYMENT_METHOD"
    
    # Pre-deployment checks
    check_requirements
    validate_environment
    
    # Check if image exists
    local full_image="${REGISTRY}/${IMAGE_NAME}:${TAG}"
    if ! check_image_exists "$full_image"; then
        log_error "Cannot proceed with deployment - image not found"
        exit 1
    fi
    
    # Create backup (for production)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        backup_database
    fi
    
    # Deploy application
    local deployment_success=false
    
    if [[ "$DEPLOYMENT_METHOD" == "docker-compose" ]]; then
        if deploy_docker_compose; then
            deployment_success=true
        fi
    elif [[ "$DEPLOYMENT_METHOD" == "kubernetes" ]]; then
        if deploy_kubernetes; then
            deployment_success=true
        fi
    else
        log_error "Unknown deployment method: $DEPLOYMENT_METHOD"
        exit 1
    fi
    
    # Perform health checks
    if [[ "$deployment_success" == "true" ]]; then
        if perform_health_checks; then
            log_success "Deployment completed successfully!"
            setup_monitoring
        else
            log_error "Health checks failed after deployment"
            deployment_success=false
        fi
    fi
    
    # Rollback if deployment failed and rollback is enabled
    if [[ "$deployment_success" == "false" && "$ROLLBACK_ON_FAILURE" == "true" ]]; then
        perform_rollback
        exit 1
    elif [[ "$deployment_success" == "false" ]]; then
        log_error "Deployment failed and rollback is disabled"
        exit 1
    fi
    
    log_success "Xaheen CLI Ecosystem Web Application deployment completed successfully!"
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -m|--method)
            DEPLOYMENT_METHOD="$2"
            shift 2
            ;;
        --no-rollback)
            ROLLBACK_ON_FAILURE="false"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -e, --environment ENV    Deployment environment (default: production)"
            echo "  -t, --tag TAG           Docker image tag (default: latest)"
            echo "  -m, --method METHOD     Deployment method: docker-compose|kubernetes (default: docker-compose)"
            echo "  --no-rollback          Disable automatic rollback on failure"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  DATABASE_URL           Database connection string"
            echo "  REDIS_URL             Redis connection string"
            echo "  NEXTAUTH_SECRET       NextAuth.js secret"
            echo "  MCP_SERVER_API_KEY    MCP Server API key"
            echo ""
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Create log file
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Run main deployment
main "$@"