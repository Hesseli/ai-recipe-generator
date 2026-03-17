export function request(ctx) { 
    const { ingredients = [] } = ctx.args; 
   
    // Construct the prompt with the provided ingredients 
    const prompt = `Suggest a recipe idea using these ingredients: 
 ${ingredients.join(", ")}.`; 
   
    // Return the request configuration 
    return { 
      resourcePath: `/model/amazon.nova-lite-v1:0/invoke`, 
      method: "POST", 
      params: { 
        headers: { 
          "Content-Type": "application/json", 
        }, 
        body: JSON.stringify({ 
          schemaVersion: "messages-v1",
          messages: [
            {
              role: "user",
              content: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          inferenceConfig: {
            max_new_tokens: 700,
            temperature: 0.7,
            top_p: 0.9,
          },
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

    const text = parsedBody?.output?.message?.content?.[0]?.text;
    if (!text) {
      return {
        error: "Bedrock response did not contain generated text",
      };
    }

    return {
      body: text,
    }; 
  }