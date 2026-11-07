# AWS: S3 + CloudFront + Lambda

Private S3 serves the demo page/privacy policy through CloudFront with OAC. `/mcp` and `/health` route to an HTTP API with Node 22 Lambda. S3 alone cannot run MCP. Current corpus: NCM/CFOP tables and selected official national/SP/MG documents; [coverage](../../docs/official-ingestion.md). Search uses lexical control without a remote LLM.

HTTP API targets 5 requests/second with burst 10; AWS limits are best effort. Lambda uses a 28-second timeout and 1,024 MiB to hold corpus/indexes with shared account concurrency. Reserved concurrency was rejected by the quota requiring at least ten unreserved executions; a future review may request an increase. Code enforces per-source instance quotas. CloudFront disables MCP caching and forwards required headers. The origin checks a deployment-generated secret header; there is no public Function URL. Function IAM only allows writes to its log group, retained for 7 days.

API Gateway was chosen instead of Lambda Function URL OAC because [AWS requires client payload hashes for POST with that OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html), which generic MCP clients do not supply. [HTTP API throttling](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-throttling.html).

Credential CSVs stay only in the ignored root. Never pass them as command-line arguments or print them. The script reads fields in memory and passes environment variables to AWS processes. Secret parameters use NoEcho; operational files stay in `.data/aws/`, outside Git. ZIP packaging contains only `index.mjs` and `corpus.json`.

Workflow: `npm run build:lambda`; `npm run public:prepare` (authorized contact in `.data/aws/contact.json`); `scripts/aws-deploy.ps1 -Action Validate`, `Start`, `Status`, `Finish`, `EnableOrigin`, `Status`, `Finish`. `EnableOrigin` pins HTTPS origin after CloudFront provides its hostname; do not repeat without a change. `Retry` accepts only complete rollback of the stack identified by this project's tag. State/resource references live in `.data/aws/deployment.json`. Final publication invalidates updated static paths.

Updates: run `npm run ingest:official`, `npm run build:lambda` and `scripts/aws-deploy.ps1 -Action Update`, then `Status`/`Finish`. The previous artifact is preserved. Builds require populated tables; CI explicitly uses `npm run build:lambda -- --demo` and does not download rules.

Independent verification: `npm run smoke:remote -- https://d2kvl1uo6lcsgz.cloudfront.net/mcp .data/aws/remote-smoke.json`. No AWS keys required. It compares service hashes/counts with the local package and checks HTTPS, four tools, input validation, provenance, present/missing codes and SP/MG searches under both protocol negotiations. This is not a test inside ChatGPT Work.

Resources use the isolated `fiscal-rag-lab-demo` stack in us-east-1 without changing existing services. Default CloudFront domains provide HTTPS without custom DNS. S3, CloudFront, API Gateway, Lambda and logs may incur usage charges; there is no provisioned concurrency, NAT Gateway, EC2 or model training. To shut down, verify identifiers in `.data/aws/deployment.json`, remove objects from deployment-exclusive buckets and delete the stack.
