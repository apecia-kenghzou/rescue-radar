import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event));

    // Enable CORS
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle OPTIONS request for CORS preflight
    if (event.requestContext.http.method === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "CORS OK" }),
        };
    }

    try {
        const typeFilter = event.queryStringParameters?.type;

        // In a production app with millions of records, you would use Query with an Index.
        // For this scale, Scan is acceptable and cost-effective.
        const params = {
            TableName: TABLE_NAME,
        };

        if (typeFilter && typeFilter !== 'all') {
            params.FilterExpression = "#type = :typeVal AND #status <> :statusVal";
            params.ExpressionAttributeNames = {
                "#type": "type",
                "#status": "status"
            };
            params.ExpressionAttributeValues = {
                ":typeVal": typeFilter,
                ":statusVal": "resolved"
            };
        } else {
            params.FilterExpression = "#status <> :statusVal";
            params.ExpressionAttributeNames = { "#status": "status" };
            params.ExpressionAttributeValues = { ":statusVal": "resolved" };
        }

        const command = new ScanCommand(params);
        const response = await docClient.send(command);

        // Sort by timestamp descending (newest first)
        const items = response.Items.sort((a, b) => b.timestamp - a.timestamp);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: items
            }),
        };

    } catch (error) {
        console.error("Error retrieving SOS submissions:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
