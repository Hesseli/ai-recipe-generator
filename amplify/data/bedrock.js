export function request(ctx) { 
    const { ingredients = [] } = ctx.args; 
   
    // Construct the prompt with the provided ingredients 
    const prompt = `Suggest a recipe idea using these ingredients: 
 ${ingredients.join(", ")}.`; 
   
    // Return the request configuration 
    return { 
      resourcePath: `/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke`, 
      method: "POST", 
      params: { 
        headers: { 
          "Content-Type": "application/json", 
        }, 
        body: JSON.stringify({ 
          anthropic_version: "bedrock-2023-05-31", 
                    max_tokens: 1000, 
          messages: [ 
            { 
              role: "user", 
              content: [ 
                { 
                  type: "text", 
                  text: `\n\nHuman: ${prompt}\n\nAssistant:`, 
                }, 
              ], 
            }, 
          ], 
        }), 
      }, 
    }; 
  } 
   
  export function response(ctx) { 
    if (ctx.error) {
      return {
        error: ctx.error.message || "Bedrock request failed",
      };
    }

    if (!ctx.result?.body) {
      return {
        error: "Bedrock returned an empty response",
      };
    }

    const parsedBody = JSON.parse(ctx.result.body);

    if (ctx.result.statusCode && ctx.result.statusCode >= 300) {
      return {
        error:
          parsedBody?.message ||
          `Bedrock returned status ${ctx.result.statusCode}`,
      };
    }

    const text = parsedBody?.content?.[0]?.text;
    if (!text) {
      return {
        error: "Bedrock response did not contain generated text",
      };
    }

    return {
      body: text,
    }; 
  }