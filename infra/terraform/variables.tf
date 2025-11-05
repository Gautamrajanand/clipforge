variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "clipforge"
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_backup_retention_days" {
  description = "RDS backup retention days"
  type        = number
  default     = 7
}

# API Server
variable "api_instance_type" {
  description = "EC2 instance type for API"
  type        = string
  default     = "t3.small"
}

variable "api_desired_capacity" {
  description = "Desired number of API instances"
  type        = number
  default     = 2
}

variable "api_min_capacity" {
  description = "Minimum number of API instances"
  type        = number
  default     = 1
}

variable "api_max_capacity" {
  description = "Maximum number of API instances"
  type        = number
  default     = 5
}

# ML Workers
variable "ml_worker_instance_type" {
  description = "GPU instance type for ML workers"
  type        = string
  default     = "g4dn.xlarge"
}

variable "ml_worker_desired_capacity" {
  description = "Desired number of ML worker instances"
  type        = number
  default     = 1
}

variable "ml_worker_min_capacity" {
  description = "Minimum number of ML worker instances"
  type        = number
  default     = 0
}

variable "ml_worker_max_capacity" {
  description = "Maximum number of ML worker instances"
  type        = number
  default     = 3
}

# Storage
variable "s3_bucket_name" {
  description = "S3 bucket name for media storage"
  type        = string
  default     = "clipforge-media"
}

variable "s3_enable_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "s3_lifecycle_days" {
  description = "Days before transitioning to Glacier"
  type        = number
  default     = 90
}

# Redis
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

# CDN
variable "cloudfront_enabled" {
  description = "Enable CloudFront CDN"
  type        = bool
  default     = true
}

variable "cloudfront_default_ttl" {
  description = "CloudFront default TTL in seconds"
  type        = number
  default     = 3600
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention days"
  type        = number
  default     = 30
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "ClipForge"
    ManagedBy   = "Terraform"
    CreatedAt   = "2024-11-04"
  }
}
