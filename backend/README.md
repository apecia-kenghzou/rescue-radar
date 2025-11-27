# Disaster Relief SOS Backend

This directory contains the serverless backend infrastructure for the Disaster Relief application.

## Architecture

- **API Gateway (HTTP API)**: Cost-effective entry point.
- **AWS Lambda**: Serverless compute (Node.js 18.x on ARM64).
- **Amazon DynamoDB**: NoSQL database with On-Demand billing.
- **AWS WAF**: Web Application Firewall to protect against DDoS (Rate Limiting).

## Prerequisites

- AWS CLI installed and configured
- AWS SAM CLI installed
- Node.js 18.x installed

## Deployment Instructions

1. **Build the application**:
   ```bash
   sam build
   ```

2. **Deploy to AWS**:
   ```bash
   sam deploy --guided
   ```
   Follow the prompts:
   - Stack Name: `sos-backend`
   - AWS Region: (e.g., `us-east-1`)
   - Confirm changes before deploy: `Y`
   - Allow SAM CLI IAM role creation: `Y`
   - Save arguments to configuration file: `Y`

3. **Get API Endpoint**:
   After successful deployment, the `ApiEndpoint` will be displayed in the outputs.
   Example: `https://xyz123.execute-api.us-east-1.amazonaws.com`

## Connecting Frontend

Once deployed, update the frontend configuration to use the real API endpoint instead of the mock API.

1. Create a `.env` file in the frontend root.
2. Add `VITE_API_URL=https://your-api-endpoint.amazonaws.com`
3. Update `src/utils/mockAPI.js` to fetch from this URL if `VITE_API_URL` is present.
