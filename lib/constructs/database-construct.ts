// lib/constructs/database-construct.ts
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface DatabaseConstructProps {
  vpc: ec2.Vpc;
  appSecurityGroup: ec2.ISecurityGroup;
}

export class DatabaseConstruct extends Construct {
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly dbInstance: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: DatabaseConstructProps) {
    super(scope, id);

    this.securityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for RDS instance',
      allowAllOutbound: true,
    });

    this.securityGroup.addIngressRule(
      props.appSecurityGroup,
      ec2.Port.tcp(3306),
      'Allow MySQL from EC2 only'
    );

    this.dbInstance = new rds.DatabaseInstance(this, 'MigrationRDS', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_36,
      }),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [this.securityGroup],
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      publiclyAccessible: false,
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      removalPolicy: RemovalPolicy.DESTROY,
      deletionProtection: false,
    });
  }
}