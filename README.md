TechHealth Inc. AWS Migration with CDK

This project modernizes TechHealth Inc.’s manually built AWS infrastructure by recreating it as Infrastructure as Code using AWS CDK with TypeScript. The new design separates the application and database tiers, improves security, and makes the environment repeatable, testable, and easy to destroy and redeploy.
Project Goals

    Replace manual AWS Console provisioning with Infrastructure as Code.

    Separate public and private network layers.

    Place EC2 in a public subnet and RDS in a private subnet.

    Enforce least-privilege access using security groups and IAM.

    Store database credentials securely with Secrets Manager.

    Keep costs low by avoiding NAT Gateways and using small instance types.

Architecture Summary

The architecture uses one VPC across two Availability Zones with public and private isolated subnets. The EC2 application server runs in a public subnet and is reachable only from approved SSH source IPs. The MySQL RDS database runs in a private subnet and is only accessible from the EC2 security group.
Main Components

    VPC: Network boundary for the application.

    Public Subnets: Host the EC2 instance.

    Private Subnets: Host the RDS instance.

    EC2: Application layer for the patient portal.

    RDS MySQL: Database layer for patient records.

    Security Groups: Enforce traffic flow between tiers.

    IAM Role: Grants the EC2 instance permissions for managed access.

    Secrets Manager: Stores RDS credentials securely.

Repository Structure

text
bin/
  app.ts
lib/
  aws-migration-stack.ts
  constructs/
    network-construct.ts
    app-construct.ts
    database-construct.ts
README.md
package.json
tsconfig.json
cdk.json

This layout keeps the stack thin and moves reusable infrastructure into constructs, which is the recommended CDK pattern.
Prerequisites

Before deploying, make sure you have:

    Node.js installed

    AWS CLI installed and configured

    AWS CDK installed globally

    An AWS account and permissions to create VPC, EC2, RDS, IAM, and Secrets Manager resources.

Installation

bash
npm install

If this is the first time using CDK in the account and region, bootstrap the environment:

bash
cdk bootstrap

Deployment

Deploy the stack with:

bash
cdk deploy

During deployment, CDK will synthesize the CloudFormation template and create the infrastructure consistently from code.
Testing

After deployment, validate the following:
1. EC2 to RDS Connectivity

    SSH or connect to the EC2 instance using Systems Manager.

    Confirm the MySQL client is installed.

    Retrieve the RDS credentials from Secrets Manager.

    Run a MySQL connection test to confirm the EC2 instance can reach RDS through the correct security group path.

Example test command:

bash
mysql -h <rds-endpoint> -u admin -p -e "SHOW DATABASES;"

2. Security Group Behavior

    Confirm SSH is allowed only from your public IP.

    Confirm RDS does not allow public access.

    Confirm only the EC2 security group can reach port 3306 on RDS.

3. Network Isolation

    Confirm EC2 is in a public subnet.

    Confirm RDS is in a private isolated subnet.

    Confirm RDS is not publicly accessible.

4. Destroy and Recreate

    Run cdk destroy to remove the stack.

    Re-run cdk deploy to confirm the infrastructure can be recreated consistently.

Cost Considerations

This project is designed to be cost-conscious:

    EC2 uses a small instance type suitable for testing.

    RDS uses a minimal MySQL instance size.

    NAT Gateways are not used.

    The stack is intended for lab and demonstration purposes, not production healthcare workloads.

Security Considerations

    SSH access is restricted to a single IP address.

    RDS is isolated from public access.

    Database credentials are managed in Secrets Manager.

    IAM permissions are kept minimal.

    Security groups are used for traffic control instead of broad network access.

User Data

The EC2 instance can use a user data script to install the MySQL client automatically at launch. This helps with validation and makes manual testing easier.

Example:

ts
const userData = ec2.UserData.forLinux();
userData.addCommands(
  'dnf update -y',
  'dnf install -y mysql',
  'echo "MySQL client installed successfully" > /var/log/user-data.log'
);

Lessons Learned

    Manual infrastructure is difficult to audit and reproduce.

    Security improves when access is controlled by design.

    CDK makes infrastructure repeatable and version-controlled.

    Clear network boundaries make troubleshooting easier.

    Small, simple architectures are easier to explain and maintain.

Cleanup

When finished testing, always destroy the stack:

bash
cdk destroy

This removes the deployed resources and helps avoid unnecessary charges.
Notes

This project is a lab-style migration for learning and demonstration. For a real healthcare production system, you would also want backups, encryption, monitoring, patching, logging, and stronger database protection controls.