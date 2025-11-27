import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event));

    // Enable CORS
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
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
        const body = JSON.parse(event.body);
        const { type, location, notes } = body;

        // Basic Validation
        if (!type || !location || !location.lat || !location.lng) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: "Missing required fields: type, location (lat, lng)" }),
            };
        }

        const id = randomUUID();
        const timestamp = Date.now();

        const item = {
            id,
            type,
            location,
            notes: notes || "",
            timestamp,
            status: 'active',
            ttl: Math.floor(timestamp / 1000) + (7 * 24 * 60 * 60) // Auto-expire after 7 days
        };

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        });

        await docClient.send(command);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: "SOS submitted successfully",
                data: item
            }),
        };

    } catch (error) {
        console.error("Error submitting SOS:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
