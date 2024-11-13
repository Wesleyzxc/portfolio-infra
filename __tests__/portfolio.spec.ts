import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { Testing } from "cdktf";
import "cdktf/lib/testing/adapters/jest";
import { Portfolio } from "../stacks/portfolio";

describe("portfolio", () => {
  it("should be a valid stack", () => {
    const app = Testing.app();
    const stack = new Portfolio(app, "my-app");

    expect(Testing.fullSynth(stack)).toBeValidTerraform();
    expect(Testing.fullSynth(stack)).toPlanSuccessfully();
  });

  it("should contain an s3 bucket with public access", () => {
    const app = Testing.app();
    const stack = new Portfolio(app, "my-app");
    const synthesized = Testing.synth(stack);

    expect(synthesized).toHaveResourceWithProperties(S3Bucket, {
      acl: "public-read",
      bucket: "wesleyzxc-portfolio",
      website: {
        index_document: "index.html"
      }
    });

    expect(synthesized).toHaveResourceWithProperties(S3BucketPublicAccessBlock, {
      block_public_acls: false,
      block_public_policy: false,
      bucket: "${aws_s3_bucket.bucket.id}",
      depends_on: [
        "aws_s3_bucket.bucket"
      ],
      ignore_public_acls: false,
      restrict_public_buckets: false
    });
  });


  it("should contain a cloudfront distribution", () => {
    const app = Testing.app();
    const stack = new Portfolio(app, "my-app");
    const synthesized = Testing.synth(stack);

    expect(synthesized).toMatchSnapshot();
  });
});