// lib/aws-migration-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NetworkConstruct } from './constructs/network-construct';
import { AppConstruct } from './constructs/app-construct';
import { DatabaseConstruct } from './constructs/database-construct';

export class AwsMigrationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const network = new NetworkConstruct(this, 'Network');
    const app = new AppConstruct(this, 'App', {
      vpc: network.vpc,
    });

    new DatabaseConstruct(this, 'Database', {
      vpc: network.vpc,
      appSecurityGroup: app.securityGroup,
    });
  }
}