#!/bin/bash

# Xaheen CLI - Production Health Check Script
# Norwegian Enterprise Grade Health Validation
# Comprehensive production readiness verification

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Norwegian compliance settings
export NSM_CLASSIFICATION="${NSM_CLASSIFICATION:-RESTRICTED}"
export GDPR_COMPLIANCE="${GDPR_COMPLIANCE:-true}"
export NORWEGIAN_LOCALE="${NORWEGIAN_LOCALE:-nb-NO}"
export TZ="${TZ:-Europe/Oslo}"

# Health check configuration
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-30}"
RETRY_COUNT="${RETRY_COUNT:-3}"
RETRY_DELAY="${RETRY_DELAY:-5}"

# Service endpoints
BASE_URL="${BASE_URL:-https://xaheen.norwegian-cloud.no}"
HEALTH_ENDPOINT="${BASE_URL}/health"
READY_ENDPOINT="${BASE_URL}/health/ready"
LIVE_ENDPOINT="${BASE_URL}/health/live"
METRICS_ENDPOINT="${BASE_URL}/metrics"
COMPLIANCE_ENDPOINT="${BASE_URL}/compliance"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Norwegian flag emoji
NORWEGIAN_FLAG="🇳🇴"

# =============================================================================
# Logging Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_norwegian() {
    echo -e "${PURPLE}${NORWEGIAN_FLAG} [NORWEGIAN]${NC} $(date '+%Y-%m-%d %H:%M:%S') $*"
}

# =============================================================================
# Utility Functions
# =============================================================================

# Make HTTP request with retry logic
http_request() {
    local url="$1"
    local expected_status="${2:-200}"
    local method="${3:-GET}"
    local timeout="${4:-$HEALTH_CHECK_TIMEOUT}"
    
    local attempt=1
    while [ $attempt -le $RETRY_COUNT ]; do
        log_info "Attempting HTTP $method to $url (attempt $attempt/$RETRY_COUNT)"
        
        local response
        local http_code
        
        if response=$(curl -s -w "\n%{http_code}" \
            --max-time "$timeout" \
            --request "$method" \
            --header "User-Agent: Xaheen-Health-Check/1.0" \
            --header "Accept: application/json" \
            --header "Accept-Language: $NORWEGIAN_LOCALE" \
            "$url" 2>/dev/null); then
            
            http_code=$(echo "$response" | tail -n1)
            response_body=$(echo "$response" | head -n -1)
            
            if [ "$http_code" = "$expected_status" ]; then
                log_success "HTTP $method $url returned $http_code"
                echo "$response_body"
                return 0
            else
                log_warning "HTTP $method $url returned $http_code, expected $expected_status"
            fi
        else
            log_warning "HTTP $method $url failed (connection error)"
        fi
        
        if [ $attempt -lt $RETRY_COUNT ]; then
            log_info "Retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
        
        ((attempt++))
    done
    
    log_error "HTTP $method $url failed after $RETRY_COUNT attempts"
    return 1
}

# Parse JSON response
parse_json() {
    local json="$1"
    local key="$2"
    echo "$json" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    keys = '$key'.split('.')
    value = data
    for k in keys:
        if k.isdigit():
            value = value[int(k)]
        else:
            value = value[k]
    print(value)
except:
    sys.exit(1)
"
}

# =============================================================================
# Health Check Functions
# =============================================================================

check_basic_connectivity() {
    log_info "🔍 Checking basic connectivity..."
    
    # Test DNS resolution
    if nslookup "$(echo "$BASE_URL" | sed 's|https\?://||' | cut -d'/' -f1)" >/dev/null 2>&1; then
        log_success "DNS resolution successful"
    else
        log_error "DNS resolution failed"
        return 1
    fi
    
    # Test TCP connectivity
    local host port
    host=$(echo "$BASE_URL" | sed 's|https\?://||' | cut -d'/' -f1 | cut -d':' -f1)
    port=$(echo "$BASE_URL" | sed 's|https\?://||' | cut -d'/' -f1 | cut -d':' -f2 -s)
    port=${port:-443}  # Default to 443 for HTTPS
    
    if timeout 10 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        log_success "TCP connectivity to $host:$port successful"
    else
        log_error "TCP connectivity to $host:$port failed"
        return 1
    fi
    
    return 0
}

check_health_endpoint() {
    log_info "🏥 Checking health endpoint..."
    
    local response
    if response=$(http_request "$HEALTH_ENDPOINT" 200); then
        local status
        status=$(parse_json "$response" "status" 2>/dev/null || echo "unknown")
        
        if [ "$status" = "healthy" ] || [ "$status" = "ok" ]; then
            log_success "Health endpoint reports: $status"
            
            # Check Norwegian compliance in health response
            local nsm_compliant
            nsm_compliant=$(parse_json "$response" "compliance.nsm" 2>/dev/null || echo "unknown")
            if [ "$nsm_compliant" = "true" ]; then
                log_norwegian "NSM compliance verified in health check"
            else
                log_warning "NSM compliance not verified in health response"
            fi
            
            return 0
        else
            log_error "Health endpoint reports unhealthy status: $status"
            return 1
        fi
    else
        log_error "Health endpoint check failed"
        return 1
    fi
}

check_readiness_endpoint() {
    log_info "🚀 Checking readiness endpoint..."
    
    local response
    if response=$(http_request "$READY_ENDPOINT" 200); then
        local ready
        ready=$(parse_json "$response" "ready" 2>/dev/null || echo "false")
        
        if [ "$ready" = "true" ]; then
            log_success "Service is ready to accept traffic"
            
            # Check database connectivity
            local db_ready
            db_ready=$(parse_json "$response" "checks.database.status" 2>/dev/null || echo "unknown")
            if [ "$db_ready" = "healthy" ]; then
                log_success "Database connectivity verified"
            else
                log_warning "Database connectivity: $db_ready"
            fi
            
            # Check cache connectivity
            local cache_ready
            cache_ready=$(parse_json "$response" "checks.cache.status" 2>/dev/null || echo "unknown")
            if [ "$cache_ready" = "healthy" ]; then
                log_success "Cache connectivity verified"
            else
                log_warning "Cache connectivity: $cache_ready"
            fi
            
            return 0
        else
            log_error "Service is not ready: $ready"
            return 1
        fi
    else
        log_error "Readiness endpoint check failed"
        return 1
    fi
}

check_liveness_endpoint() {
    log_info "💓 Checking liveness endpoint..."
    
    local response
    if response=$(http_request "$LIVE_ENDPOINT" 200); then
        local alive
        alive=$(parse_json "$response" "alive" 2>/dev/null || echo "false")
        
        if [ "$alive" = "true" ]; then
            log_success "Service is alive and responsive"
            
            # Check application health
            local app_healthy
            app_healthy=$(parse_json "$response" "checks.application.status" 2>/dev/null || echo "unknown")
            if [ "$app_healthy" = "healthy" ]; then
                log_success "Application health verified"
            else
                log_warning "Application health: $app_healthy"
            fi
            
            return 0
        else
            log_error "Service liveness check failed: $alive"
            return 1
        fi
    else
        log_error "Liveness endpoint check failed"
        return 1
    fi
}

check_metrics_endpoint() {
    log_info "📊 Checking metrics endpoint..."
    
    local response
    if response=$(http_request "$METRICS_ENDPOINT" 200); then
        # Validate Prometheus metrics format
        if echo "$response" | grep -q "^# HELP\|^# TYPE"; then
            log_success "Metrics endpoint returning valid Prometheus format"
            
            # Check for Norwegian compliance metrics
            if echo "$response" | grep -q "nsm_classification"; then
                log_norwegian "NSM classification metrics present"
            fi
            
            if echo "$response" | grep -q "gdpr_compliance"; then
                log_norwegian "GDPR compliance metrics present"
            fi
            
            if echo "$response" | grep -q "norwegian_locale"; then
                log_norwegian "Norwegian locale metrics present"
            fi
            
            # Count available metrics
            local metric_count
            metric_count=$(echo "$response" | grep -c "^# TYPE" || echo "0")
            log_info "Available metrics: $metric_count"
            
            return 0
        else
            log_error "Metrics endpoint not returning valid Prometheus format"
            return 1
        fi
    else
        log_error "Metrics endpoint check failed"
        return 1
    fi
}

check_norwegian_compliance() {
    log_norwegian "🛡️ Checking Norwegian compliance endpoints..."
    
    # NSM compliance check
    local nsm_response
    if nsm_response=$(http_request "$COMPLIANCE_ENDPOINT/nsm" 200); then
        local nsm_compliant
        nsm_compliant=$(parse_json "$nsm_response" "compliant" 2>/dev/null || echo "false")
        
        if [ "$nsm_compliant" = "true" ]; then
            log_norwegian "NSM compliance verified"
            
            local classification
            classification=$(parse_json "$nsm_response" "classification" 2>/dev/null || echo "unknown")
            log_norwegian "NSM Classification: $classification"
            
            if [ "$classification" = "$NSM_CLASSIFICATION" ]; then
                log_success "NSM classification matches expected: $NSM_CLASSIFICATION"
            else
                log_warning "NSM classification mismatch. Expected: $NSM_CLASSIFICATION, Got: $classification"
            fi
        else
            log_error "NSM compliance check failed"
            return 1
        fi
    else
        log_error "NSM compliance endpoint unavailable"
        return 1
    fi
    
    # GDPR compliance check
    local gdpr_response
    if gdpr_response=$(http_request "$COMPLIANCE_ENDPOINT/gdpr" 200); then
        local gdpr_compliant
        gdpr_compliant=$(parse_json "$gdpr_response" "compliant" 2>/dev/null || echo "false")
        
        if [ "$gdpr_compliant" = "true" ]; then
            log_norwegian "GDPR compliance verified"
            
            local data_localization
            data_localization=$(parse_json "$gdpr_response" "dataLocalization" 2>/dev/null || echo "unknown")
            if [ "$data_localization" = "norway" ]; then
                log_norwegian "Data localization confirmed: Norway"
            else
                log_warning "Data localization: $data_localization"
            fi
        else
            log_error "GDPR compliance check failed"
            return 1
        fi
    else
        log_error "GDPR compliance endpoint unavailable"
        return 1
    fi
    
    return 0
}

check_performance_metrics() {
    log_info "⚡ Checking performance metrics..."
    
    local response
    if response=$(http_request "$METRICS_ENDPOINT" 200); then
        # Extract performance metrics
        local response_time_p95
        response_time_p95=$(echo "$response" | grep "http_request_duration_seconds{quantile=\"0.95\"" | grep -o '[0-9.]*$' || echo "0")
        
        if [ -n "$response_time_p95" ] && [ "$response_time_p95" != "0" ]; then
            log_info "95th percentile response time: ${response_time_p95}s"
            
            # Norwegian SLA requirement: <2s response time
            if (( $(echo "$response_time_p95 < 2.0" | bc -l) )); then
                log_success "Response time meets Norwegian SLA (<2s)"
            else
                log_warning "Response time exceeds Norwegian SLA: ${response_time_p95}s"
            fi
        else
            log_warning "Response time metrics not available"
        fi
        
        # Check memory usage
        local memory_usage
        memory_usage=$(echo "$response" | grep "process_resident_memory_bytes" | grep -o '[0-9]*$' || echo "0")
        if [ -n "$memory_usage" ] && [ "$memory_usage" != "0" ]; then
            local memory_mb=$((memory_usage / 1024 / 1024))
            log_info "Memory usage: ${memory_mb}MB"
            
            # Check if within limits (assuming 2GB limit)
            if [ $memory_mb -lt 1600 ]; then
                log_success "Memory usage within Norwegian enterprise limits"
            else
                log_warning "Memory usage approaching limits: ${memory_mb}MB"
            fi
        fi
        
        # Check error rate
        local error_rate
        error_rate=$(echo "$response" | grep "http_requests_total.*5[0-9][0-9]" | grep -o '[0-9.]*$' || echo "0")
        if [ -n "$error_rate" ]; then
            log_info "HTTP 5xx error count: $error_rate"
            
            # Norwegian SLA requirement: <1% error rate
            if [ "${error_rate%.*}" -eq 0 ]; then
                log_success "Error rate meets Norwegian SLA"
            else
                log_warning "Error rate detected: $error_rate"
            fi
        fi
        
        return 0
    else
        log_error "Could not retrieve performance metrics"
        return 1
    fi
}

check_security_headers() {
    log_info "🔒 Checking security headers..."
    
    local headers
    if headers=$(curl -s -I --max-time "$HEALTH_CHECK_TIMEOUT" "$BASE_URL" 2>/dev/null); then
        # Check required security headers
        local required_headers=(
            "X-Content-Type-Options"
            "X-Frame-Options"
            "X-XSS-Protection"
            "Strict-Transport-Security"
            "Content-Security-Policy"
        )
        
        local missing_headers=()
        for header in "${required_headers[@]}"; do
            if echo "$headers" | grep -qi "^$header:"; then
                log_success "Security header present: $header"
            else
                missing_headers+=("$header")
                log_warning "Security header missing: $header"
            fi
        done
        
        if [ ${#missing_headers[@]} -eq 0 ]; then
            log_success "All required security headers present"
        else
            log_warning "Missing ${#missing_headers[@]} security headers"
        fi
        
        # Check for Norwegian compliance headers
        if echo "$headers" | grep -qi "NSM-Classification:"; then
            log_norwegian "NSM classification header present"
        fi
        
        if echo "$headers" | grep -qi "GDPR-Compliant:"; then
            log_norwegian "GDPR compliance header present"
        fi
        
        return 0
    else
        log_error "Could not retrieve security headers"
        return 1
    fi
}

check_ssl_certificate() {
    log_info "🔐 Checking SSL certificate..."
    
    local host
    host=$(echo "$BASE_URL" | sed 's|https\?://||' | cut -d'/' -f1 | cut -d':' -f1)
    
    local cert_info
    if cert_info=$(echo | openssl s_client -connect "$host:443" -servername "$host" 2>/dev/null | openssl x509 -noout -dates -subject -issuer 2>/dev/null); then
        log_success "SSL certificate retrieved successfully"
        
        # Check expiration
        local not_after
        not_after=$(echo "$cert_info" | grep "notAfter=" | cut -d'=' -f2)
        if [ -n "$not_after" ]; then
            log_info "Certificate expires: $not_after"
            
            # Check if certificate expires within 30 days
            local expiry_timestamp
            expiry_timestamp=$(date -d "$not_after" +%s 2>/dev/null || echo "0")
            local current_timestamp
            current_timestamp=$(date +%s)
            local days_remaining=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ $days_remaining -gt 30 ]; then
                log_success "Certificate valid for $days_remaining days"
            elif [ $days_remaining -gt 0 ]; then
                log_warning "Certificate expires in $days_remaining days"
            else
                log_error "Certificate has expired"
                return 1
            fi
        fi
        
        # Check subject
        local subject
        subject=$(echo "$cert_info" | grep "subject=" | cut -d'=' -f2-)
        if [ -n "$subject" ]; then
            log_info "Certificate subject: $subject"
        fi
        
        return 0
    else
        log_error "Could not retrieve SSL certificate information"
        return 1
    fi
}

# =============================================================================
# Comprehensive Health Check
# =============================================================================

run_comprehensive_health_check() {
    log_info "🏥 Starting comprehensive production health check for Xaheen CLI"
    log_norwegian "Norwegian Enterprise Grade Health Validation"
    log_info "Target: $BASE_URL"
    log_info "NSM Classification: $NSM_CLASSIFICATION"
    log_info "GDPR Compliance: $GDPR_COMPLIANCE"
    log_info "Norwegian Locale: $NORWEGIAN_LOCALE"
    echo

    local failed_checks=0
    local total_checks=0
    
    # Define all health checks
    local checks=(
        "check_basic_connectivity:Basic Connectivity"
        "check_health_endpoint:Health Endpoint"
        "check_readiness_endpoint:Readiness Endpoint"
        "check_liveness_endpoint:Liveness Endpoint"
        "check_metrics_endpoint:Metrics Endpoint"
        "check_norwegian_compliance:Norwegian Compliance"
        "check_performance_metrics:Performance Metrics"
        "check_security_headers:Security Headers"
        "check_ssl_certificate:SSL Certificate"
    )
    
    for check in "${checks[@]}"; do
        local check_function="${check%%:*}"
        local check_name="${check##*:}"
        
        echo
        log_info "=========================================="
        log_info "Running: $check_name"
        log_info "=========================================="
        
        ((total_checks++))
        
        if $check_function; then
            log_success "$check_name: PASSED"
        else
            log_error "$check_name: FAILED"
            ((failed_checks++))
        fi
    done
    
    # Summary
    echo
    log_info "=========================================="
    log_info "HEALTH CHECK SUMMARY"
    log_info "=========================================="
    
    local passed_checks=$((total_checks - failed_checks))
    log_info "Total checks: $total_checks"
    log_success "Passed: $passed_checks"
    
    if [ $failed_checks -gt 0 ]; then
        log_error "Failed: $failed_checks"
        echo
        log_error "🇳🇴 Xaheen CLI is NOT production ready"
        log_error "Norwegian enterprise requirements not met"
        return 1
    else
        log_success "Failed: 0"
        echo
        log_success "🇳🇴 Xaheen CLI is production ready!"
        log_norwegian "All Norwegian enterprise requirements met"
        log_success "Service is ready for Norwegian production deployment"
        return 0
    fi
}

# =============================================================================
# Generate Health Report
# =============================================================================

generate_health_report() {
    local report_file="${PROJECT_ROOT}/health-report-$(date +%Y%m%d-%H%M%S).json"
    
    log_info "📋 Generating health report: $report_file"
    
    cat > "$report_file" << EOF
{
  "healthCheck": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "service": "xaheen-cli",
    "version": "1.0.0",
    "environment": "production",
    "baseUrl": "$BASE_URL",
    "norwegianCompliance": {
      "nsmClassification": "$NSM_CLASSIFICATION",
      "gdprCompliance": $GDPR_COMPLIANCE,
      "locale": "$NORWEGIAN_LOCALE",
      "timezone": "$TZ"
    },
    "checks": {
      "connectivity": "$(check_basic_connectivity >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "health": "$(check_health_endpoint >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "readiness": "$(check_readiness_endpoint >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "liveness": "$(check_liveness_endpoint >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "metrics": "$(check_metrics_endpoint >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "compliance": "$(check_norwegian_compliance >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "performance": "$(check_performance_metrics >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "security": "$(check_security_headers >/dev/null 2>&1 && echo "passed" || echo "failed")",
      "ssl": "$(check_ssl_certificate >/dev/null 2>&1 && echo "passed" || echo "failed")"
    }
  }
}
EOF
    
    log_success "Health report generated: $report_file"
}

# =============================================================================
# Main Function
# =============================================================================

main() {
    local generate_report=false
    local quiet=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --base-url)
                BASE_URL="$2"
                shift 2
                ;;
            --report)
                generate_report=true
                shift
                ;;
            --quiet)
                quiet=true
                shift
                ;;
            --timeout)
                HEALTH_CHECK_TIMEOUT="$2"
                shift 2
                ;;
            --retries)
                RETRY_COUNT="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "  --base-url URL    Base URL for health checks (default: $BASE_URL)"
                echo "  --report          Generate JSON health report"
                echo "  --quiet           Suppress verbose output"
                echo "  --timeout SEC     Request timeout in seconds (default: $HEALTH_CHECK_TIMEOUT)"
                echo "  --retries N       Number of retries (default: $RETRY_COUNT)"
                echo "  --help            Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    if [ "$quiet" = true ]; then
        exec 1>/dev/null
    fi
    
    # Check dependencies
    local dependencies=(curl nslookup openssl python3 bc)
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" >/dev/null 2>&1; then
            log_error "Required dependency not found: $dep"
            exit 1
        fi
    done
    
    # Run comprehensive health check
    if run_comprehensive_health_check; then
        if [ "$generate_report" = true ]; then
            generate_health_report
        fi
        exit 0
    else
        if [ "$generate_report" = true ]; then
            generate_health_report
        fi
        exit 1
    fi
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi