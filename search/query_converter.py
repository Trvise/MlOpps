import os
import json
import requests
import boto3
from botocore.exceptions import ClientError

# Create a client to interact with the Bedrock service
# It will automatically use the credentials from `aws configure`
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime', 
    region_name='us-east-1' # Or another region where you have Bedrock access
)

    
def validate_user_answer(user_query, db_schema):
    """Converts a natural language query into a structured JSON using AWS Bedrock (Amazon Titan)."""

    # The prompt generation stays the same
    schema_description = "\n".join([f'- "{col}" ({dtype})' for col, dtype in db_schema.items()])
    prompt = f"""
        You are a data query assistant. Convert a user's question into a structured JSON object based on the provided database schema.

        Database Schema:
        {schema_description}

        Your JSON output must have two keys: "semantic_query" (for visual descriptions, otherwise null) and "filters" (a list of structured filters).

        Example 1:
        User Query: "Show me all the trucks"
        Your JSON:
        ```json
        {{
        "semantic_query": "a truck",
        "filters": []
        }}
        ```

        Example 2:
        User Query: "Find frames where the Truck was in Mississauga and the speed was less than 20 m/s"
        Your JSON:
        ```json
        {{
        "semantic_query": "a truck",
        "filters": [
            {{ "column": "location", "operator": "==", "value": "Mississauga" }},
            {{ "column": "speed_mps", "operator": "<", "value": 20 }}
        ]
        }}
        ```

        Now, convert the following query. Respond with ONLY the JSON object.

        User Query: "{user_query}"
        Your JSON:
    """

    model_id = 'meta.llama3-70b-instruct-v1:0'

    request_body = {
        "prompt": prompt,
        "max_gen_len": 2048,
        "temperature": 0.0,
    }

    try:
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body)
        )
        

        response_body = json.loads(response.get('body').read())
        
        # 3. The way you get the text out of the response is also different
        text_content = response_body.get('generation')
        
        # This cleaning logic is robust
        start = text_content.find('{')
        end = text_content.rfind('}')
        clean_text = text_content[start:end+1]
        
        llm_response_data = json.loads(clean_text)
        return llm_response_data

    except ClientError as e:
        return {"error": f"AWS Bedrock request failed: {e}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}


if __name__ == "__main__":
    DB_SCHEMA = {
        "timestamp": "float",
        "speed_mps": "float",
        "location": "string",
        "acceleration_mps2": "float"
    }

    queries_to_test = [
        "get me frames that have a truck that is going a speed of 200 m/s and it is located in brampton",
        "show me cars",
        "find everything in Brampton with a speed greater than or equal to 50",
        "get me all the trucks in north dakota",
        "show me cars faster than 100 m/s and acceleration faster than 10 m/s2",
        "get me all the objects that are going faster than 100 m/s and the object is a truck"
    ]

    for query in queries_to_test:
        print(f"NLQ: '{query}'")
        structured_json = validate_user_answer(query, DB_SCHEMA)
        print("JSON:")
        print(json.dumps(structured_json, indent=2))
        print("-" * 50)