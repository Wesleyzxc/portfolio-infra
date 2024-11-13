import { Construct } from "constructs";
import { TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { DEFAULT_REGION } from "../config";

export class Portfolio extends TerraformStack {
    private BUCKET_NAME = "wesleyzxc-portfolio";
  
    constructor(scope: Construct, id: string) {
      super(scope, id);
      
  
      new AwsProvider(this, "aws", {
        region: DEFAULT_REGION,
      });
  
      const bucket = new S3Bucket(this, "bucket", {
        bucket: this.BUCKET_NAME,
        acl: 'public-read',
        website: {indexDocument: 'index.html'},
        
        policy: `{
          "Version": "2012-10-17",
          "Statement": [
            {
              "Sid": "PublicReadGetObject",
              "Effect": "Allow",
              "Principal": "*",
              "Action": [
                "s3:GetObject"
              ],
              "Resource": [
                "arn:aws:s3:::${this.BUCKET_NAME}/*"
              ]
            }
          ]
        }`,
      });
  
      new S3BucketPublicAccessBlock(this, "bucketPublicAccess", {
        bucket: bucket.id,
  
        blockPublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
        ignorePublicAcls: false,
  
        dependsOn: [bucket]
      })
  
      new CloudfrontDistribution(this, "distribution", {
        enabled: true,
        defaultRootObject: 'index.html',
        isIpv6Enabled: true,
  
        viewerCertificate: {
          cloudfrontDefaultCertificate: true,
          sslSupportMethod: "sni-only",
        },
  
        restrictions: {
          geoRestriction: {
            restrictionType: "none",
          },
        },
  
        defaultCacheBehavior: {
          allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
          cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
          targetOriginId: bucket.id,
          viewerProtocolPolicy: "redirect-to-https"
        },
        origin: [{
          originId: bucket.id,
          domainName: bucket.bucketDomainName,
          customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "http-only",
            originSslProtocols: ["TLSv1.2", "TLSv1.1"],
          }
        }],
      })
    }
  }