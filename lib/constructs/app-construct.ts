// lib/constructs/app-construct.ts
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface AppConstructProps {
  vpc: ec2.Vpc;
}

export class AppConstruct extends Construct {
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: AppConstructProps) {
    super(scope, id);

    this.securityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for EC2 instance',
      allowAllOutbound: true,
    });

    this.securityGroup.addIngressRule(
      ec2.Peer.ipv4('YOUR_PUBLIC_IP/32'),
      ec2.Port.tcp(22),
      'Allow SSH from my IP'
    );

    const ec2Role = new iam.Role(this, 'EC2IAMRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    this.instance = new ec2.Instance(this, 'MigrationEC2', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: this.securityGroup,
      role: ec2Role,
    });
  }
}