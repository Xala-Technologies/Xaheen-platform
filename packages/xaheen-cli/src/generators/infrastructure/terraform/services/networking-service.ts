/**
 * Terraform Networking Service Implementation
 * Handles VPC, Subnets, Routing, and Security Groups following SRP
 */

import { GeneratedInfrastructureFile } from "../../index.js";
import { 
  ITerraformNetworkingService, 
  TerraformValidationResult,
  TerraformValidationError,
  ITerraformTemplateGenerator,
  ITerraformConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  TerraformBaseConfig, 
  TerraformNetworkingConfig,
  TerraformVPCConfig,
  TerraformSubnetsConfig,
  TerraformSecurityGroup
} from "../interfaces/index.js";
import { BaseTerraformService } from "./base-terraform-service.js";

export class TerraformNetworkingService extends BaseTerraformService implements ITerraformNetworkingService {
  private readonly networkingConfig: TerraformNetworkingConfig;

  constructor(
    baseConfig: TerraformBaseConfig,
    networkingConfig: TerraformNetworkingConfig,
    templateGenerator: ITerraformTemplateGenerator,
    configManager: ITerraformConfigurationManager
  ) {
    super(baseConfig, templateGenerator, configManager);
    this.networkingConfig = networkingConfig;
  }

  get name(): string {
    return "terraform-networking";
  }

  get cloudProvider(): string {
    return this.config.cloudProvider;
  }

  isEnabled(): boolean {
    return this.networkingConfig.vpc.enabled;
  }

  async generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];

    if (this.networkingConfig.vpc.enabled) {
      files.push(...await this.generateVPC(outputDir));
    }

    if (this.networkingConfig.subnets.type !== "none") {
      files.push(...await this.generateSubnets(outputDir));
    }

    if (this.networkingConfig.routing.createInternetGateway || this.networkingConfig.routing.createNatGateway) {
      files.push(...await this.generateRouting(outputDir));
    }

    if (this.networkingConfig.security.defaultSecurityGroups || this.networkingConfig.security.customSecurityGroups.length > 0) {
      files.push(...await this.generateSecurityGroups(outputDir));
    }

    return files;
  }

  async generateVPC(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    
    switch (this.config.cloudProvider) {
      case "aws":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/vpc.tf`,
          this.generateAWSVPC(),
          "terraform",
          "AWS VPC configuration"
        ));
        break;
      case "azure":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/vnet.tf`,
          this.generateAzureVNet(),
          "terraform",
          "Azure Virtual Network configuration"
        ));
        break;
      case "gcp":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/vpc.tf`,
          this.generateGCPVPC(),
          "terraform",
          "GCP VPC configuration"
        ));
        break;
    }

    return files;
  }

  async generateSubnets(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    
    switch (this.config.cloudProvider) {
      case "aws":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/subnets.tf`,
          this.generateAWSSubnets(),
          "terraform",
          "AWS Subnets configuration"
        ));
        break;
      case "azure":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/subnets.tf`,
          this.generateAzureSubnets(),
          "terraform",
          "Azure Subnets configuration"
        ));
        break;
      case "gcp":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/subnets.tf`,
          this.generateGCPSubnets(),
          "terraform",
          "GCP Subnets configuration"
        ));
        break;
    }

    return files;
  }

  async generateRouting(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    
    switch (this.config.cloudProvider) {
      case "aws":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/routing.tf`,
          this.generateAWSRouting(),
          "terraform",
          "AWS Routing configuration"
        ));
        break;
      case "azure":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/routing.tf`,
          this.generateAzureRouting(),
          "terraform",
          "Azure Routing configuration"
        ));
        break;
      case "gcp":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/routing.tf`,
          this.generateGCPRouting(),
          "terraform",
          "GCP Routing configuration"
        ));
        break;
    }

    return files;
  }

  async generateSecurityGroups(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    
    switch (this.config.cloudProvider) {
      case "aws":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/security-groups.tf`,
          this.generateAWSSecurityGroups(),
          "terraform",
          "AWS Security Groups configuration"
        ));
        break;
      case "azure":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/network-security-groups.tf`,
          this.generateAzureNSGs(),
          "terraform",
          "Azure Network Security Groups configuration"
        ));
        break;
      case "gcp":
        files.push(this.createFile(
          `${outputDir}/terraform/networking/firewall.tf`,
          this.generateGCPFirewall(),
          "terraform",
          "GCP Firewall Rules configuration"
        ));
        break;
    }

    return files;
  }

  async validateNetworkingConfig(): Promise<TerraformValidationResult> {
    const errors: TerraformValidationError[] = [];
    const warnings = [];

    // Validate VPC configuration
    if (this.networkingConfig.vpc.enabled) {
      const vpcValidation = this.validateVPCConfig(this.networkingConfig.vpc);
      errors.push(...vpcValidation);
    }

    // Validate subnets configuration
    const subnetsValidation = this.validateSubnetsConfig(this.networkingConfig.subnets);
    errors.push(...subnetsValidation);

    // Validate security groups
    for (const sg of this.networkingConfig.security.customSecurityGroups) {
      const sgValidation = this.validateSecurityGroup(sg);
      errors.push(...sgValidation);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected async validateServiceConfig(): Promise<TerraformValidationResult> {
    return this.validateNetworkingConfig();
  }

  private validateVPCConfig(config: TerraformVPCConfig): TerraformValidationError[] {
    const errors: TerraformValidationError[] = [];

    // Validate CIDR block
    const cidrValidation = this.validateCidr(config.cidrBlock, "vpc.cidrBlock");
    if (cidrValidation) errors.push(cidrValidation);

    return errors;
  }

  private validateSubnetsConfig(config: TerraformSubnetsConfig): TerraformValidationError[] {
    const errors: TerraformValidationError[] = [];

    // Validate subnet type
    const typeValidation = this.validateEnum(
      config.type,
      ["public", "private", "both"],
      "subnets.type"
    );
    if (typeValidation) errors.push(typeValidation);

    // Validate availability zones
    const azValidation = this.validateRange(
      config.availabilityZones,
      1,
      6,
      "subnets.availabilityZones"
    );
    if (azValidation) errors.push(azValidation);

    // Validate CIDR blocks
    for (const [index, cidr] of config.publicSubnets.entries()) {
      const cidrValidation = this.validateCidr(cidr, `subnets.publicSubnets[${index}]`);
      if (cidrValidation) errors.push(cidrValidation);
    }

    for (const [index, cidr] of config.privateSubnets.entries()) {
      const cidrValidation = this.validateCidr(cidr, `subnets.privateSubnets[${index}]`);
      if (cidrValidation) errors.push(cidrValidation);
    }

    return errors;
  }

  private validateSecurityGroup(sg: TerraformSecurityGroup): TerraformValidationError[] {
    const errors: TerraformValidationError[] = [];

    const nameValidation = this.validateRequired(sg.name, "securityGroup.name");
    if (nameValidation) errors.push(nameValidation);

    // Validate rules
    for (const [index, rule] of sg.ingress.entries()) {
      if (rule.fromPort < 0 || rule.fromPort > 65535) {
        errors.push({
          field: `securityGroup.ingress[${index}].fromPort`,
          message: "Port must be between 0 and 65535",
          severity: "error",
          code: "INVALID_PORT_RANGE"
        });
      }
    }

    return errors;
  }

  private generateAWSVPC(): string {
    const vpc = this.networkingConfig.vpc;
    return `
# AWS VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "${vpc.cidrBlock}"
  enable_dns_hostnames = ${vpc.enableDnsHostnames}
  enable_dns_support   = ${vpc.enableDnsSupport}

  tags = {
    Name = "${this.getResourceName('vpc')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}

${vpc.enableVpnGateway ? `
# VPN Gateway
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${this.getResourceName('vpn-gateway')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
` : ''}
`;
  }

  private generateAWSSubnets(): string {
    const subnets = this.networkingConfig.subnets;
    let terraform = "";

    // Data source for availability zones
    terraform += `
# Get available availability zones
data "aws_availability_zones" "available" {
  state = "available"
}
`;

    // Public subnets
    if (subnets.type === "public" || subnets.type === "both") {
      terraform += `
# Public Subnets
${subnets.publicSubnets.map((cidr, index) => `
resource "aws_subnet" "public_${index + 1}" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "${cidr}"
  availability_zone       = data.aws_availability_zones.available.names[${index}]
  map_public_ip_on_launch = true

  tags = {
    Name = "${this.getResourceName(`public-subnet-${index + 1}`)}"
    Type = "Public"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
`).join('')}
`;
    }

    // Private subnets
    if (subnets.type === "private" || subnets.type === "both") {
      terraform += `
# Private Subnets
${subnets.privateSubnets.map((cidr, index) => `
resource "aws_subnet" "private_${index + 1}" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "${cidr}"
  availability_zone = data.aws_availability_zones.available.names[${index}]

  tags = {
    Name = "${this.getResourceName(`private-subnet-${index + 1}`)}"
    Type = "Private"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
`).join('')}
`;
    }

    return terraform;
  }

  private generateAWSRouting(): string {
    const routing = this.networkingConfig.routing;
    let terraform = "";

    if (routing.createInternetGateway) {
      terraform += `
# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${this.getResourceName('igw')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${this.getResourceName('public-rt')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
`;
    }

    if (routing.createNatGateway) {
      terraform += `
# NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
  depends_on = [aws_internet_gateway.main]

  tags = {
    Name = "${this.getResourceName('nat-eip')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id
  depends_on    = [aws_internet_gateway.main]

  tags = {
    Name = "${this.getResourceName('nat-gateway')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}

# Private Route Table
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${this.getResourceName('private-rt')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
`;
    }

    return terraform;
  }

  private generateAWSSecurityGroups(): string {
    const security = this.networkingConfig.security;
    let terraform = "";

    if (security.defaultSecurityGroups) {
      terraform += `
# Default Security Group for Web Servers
resource "aws_security_group" "web" {
  name_prefix = "${this.getResourceName('web')}-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${this.getResourceName('web-sg')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}

# Default Security Group for Database
resource "aws_security_group" "database" {
  name_prefix = "${this.getResourceName('database')}-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  tags = {
    Name = "${this.getResourceName('database-sg')}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
`;
    }

    // Custom security groups
    security.customSecurityGroups.forEach(sg => {
      terraform += `
# Custom Security Group: ${sg.name}
resource "aws_security_group" "${sg.name.replace(/-/g, '_')}" {
  name        = "${sg.name}"
  description = "${sg.description}"
  vpc_id      = aws_vpc.main.id

  ${sg.ingress.map(rule => `
  ingress {
    from_port   = ${rule.fromPort}
    to_port     = ${rule.toPort}
    protocol    = "${rule.protocol}"
    ${rule.cidrBlocks ? `cidr_blocks = ${JSON.stringify(rule.cidrBlocks)}` : ''}
    ${rule.sourceSecurityGroup ? `source_security_group_id = ${rule.sourceSecurityGroup}` : ''}
    ${rule.description ? `description = "${rule.description}"` : ''}
  }
  `).join('')}

  ${sg.egress.map(rule => `
  egress {
    from_port   = ${rule.fromPort}
    to_port     = ${rule.toPort}
    protocol    = "${rule.protocol}"
    ${rule.cidrBlocks ? `cidr_blocks = ${JSON.stringify(rule.cidrBlocks)}` : ''}
    ${rule.sourceSecurityGroup ? `source_security_group_id = ${rule.sourceSecurityGroup}` : ''}
    ${rule.description ? `description = "${rule.description}"` : ''}
  }
  `).join('')}

  tags = {
    Name = "${sg.name}"
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
`;
    });

    return terraform;
  }

  private generateAzureVNet(): string {
    const vpc = this.networkingConfig.vpc;
    return `
# Azure Virtual Network Configuration
resource "azurerm_virtual_network" "main" {
  name                = "${this.getResourceName('vnet')}"
  address_space       = ["${vpc.cidrBlock}"]
  location            = var.region
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    ${Object.entries(this.addTags()).map(([k, v]) => `${k} = "${v}"`).join('\n    ')}
  }
}
`;
  }

  private generateAzureSubnets(): string {
    // Placeholder implementation for Azure subnets
    return "# Azure Subnets configuration (placeholder)";
  }

  private generateAzureRouting(): string {
    // Placeholder implementation for Azure routing
    return "# Azure Routing configuration (placeholder)";
  }

  private generateAzureNSGs(): string {
    // Placeholder implementation for Azure NSGs
    return "# Azure Network Security Groups configuration (placeholder)";
  }

  private generateGCPVPC(): string {
    const vpc = this.networkingConfig.vpc;
    return `
# GCP VPC Configuration
resource "google_compute_network" "main" {
  name                    = "${this.getResourceName('vpc')}"
  auto_create_subnetworks = false
  routing_mode           = "REGIONAL"

  # Labels equivalent to tags
  # Note: GCP uses labels instead of tags
}
`;
  }

  private generateGCPSubnets(): string {
    // Placeholder implementation for GCP subnets
    return "# GCP Subnets configuration (placeholder)";
  }

  private generateGCPRouting(): string {
    // Placeholder implementation for GCP routing
    return "# GCP Routing configuration (placeholder)";
  }

  private generateGCPFirewall(): string {
    // Placeholder implementation for GCP firewall
    return "# GCP Firewall Rules configuration (placeholder)";
  }
}