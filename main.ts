import { App, S3Backend } from "cdktf";
import { DEFAULT_REGION } from "./config";
import { Portfolio } from "./stacks/portfolio";

const app = new App();
const stack = new Portfolio(app, "portfolio-infra");

const TF_STATE_BUCKET = 'wesley-tf';
new S3Backend(stack, {
  bucket: TF_STATE_BUCKET,
  region: DEFAULT_REGION,
  key: 'state',
});

app.synth();
