provider "aws" {
  profile = "default"
  region  = "us-east-1"
}

resource "aws_dynamodb_table" "auth" {
  name           = "auth"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "Token"

  attribute {
    name = "Token"
    type = "S"
  }

  ttl {
    attribute_name = "Expires"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "user" {
  name           = "user"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "UserID"

  attribute {
    name = "UserID"
    type = "S"
  }
}

resource "aws_dynamodb_table" "route" {
  name           = "route"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "To"

  attribute {
    name = "To"
    type = "S"
  }
}
