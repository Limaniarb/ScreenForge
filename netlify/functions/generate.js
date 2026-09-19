"use strict";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
        html: {
            type: "string"
        },
        css: {
            type: "string"
        },
        js: {
            type: "string"
        }
    },
    required: ["html", "css", "js"]
};

function json(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        },
        body: JSON.stringify(body)
    };
}

function extractOutputText(data) {
    if (
        typeof data?.output_text === "string" &&
        data.output_text.trim()
    ) {
        return data.output_text.trim();
    }

    const pieces = [];

    for (const item of data?.output || []) {
        for (const content of item?.content || []) {
            if (typeof content?.text === "string") {
                pieces.push(content.text);
            }
        }
    }

    return pieces.join("\n").trim();
}

exports.handler = async function (event) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return json(405, {
            error: "Method not allowed"
        });
    }

    // Get API key from Netlify environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return json(500, {
            error: "OPENAI_API_KEY is not configured on Netlify."
        });
    }

    // Read request body
    let body;

    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return json(400, {
            error: "Invalid request body."
        });
    }

    const image = body?.image;
    const options = body?.options || {};

    // Check screenshot
    if (
        typeof image !== "string" ||
        !image.startsWith("data:image/")
    ) {
        return json(400, {
            error: "A valid screenshot is required."
        });
    }

    const prompt = `
You are ScreenForge, a production-quality screenshot-to-website generator.

Inspect the supplied screenshot and recreate the visible interface as accurately as possible using semantic HTML, modern CSS, and small vanilla JavaScript only.

Rules:

- Return only the JSON object matching the provided schema.
- The screenshot is the source of truth.
- Recreate the actual visual structure.
- Do not create a generic unrelated template.
- Match the screenshot's layout.
- Match spacing.
- Match colors.
- Match typography.
- Match borders.
- Match shadows.
- Match buttons.
- Match cards.
- Match navigation.
- Match visible images using CSS shapes or inline SVG when necessary.
- Use semantic HTML.
- Put all styling inside CSS.
- Put behavior inside vanilla JavaScript.
- Do not use React.
- Do not use Vue.
- Do not use Angular.
- Do not use Tailwind.
- Do not use Bootstrap.
- Do not use jQuery.
- Do not use external component libraries.
- Do not load external images.
- Make the result responsive.
- Keep the code clean and production-ready.
- The HTML field must contain body markup only.
- Do not include html, head, or body tags inside the HTML field.
- Do not put CSS inside the HTML field.
- Do not put JavaScript inside the HTML field.
- Put CSS only in the css field.
- Put JavaScript only in the js field.
- Recreate the screenshot instead of inventing a completely different design.

User options:

- Responsive layout:
  ${options.responsive ? "yes" : "no"}

- Modernize UI:
  ${
      options.modernize
          ? "yes, but preserve the screenshot structure"
          : "no"
  }

- Animations:
  ${options.animations ? "yes, subtle only" : "no"}
`;

    try {
        const response = await fetch(OPENAI_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },

            body: JSON.stringify({
                model: MODEL,

                instructions: prompt,

                input: [
                    {
                        role: "user",

                        content: [
                            {
                                type: "input_text",
                                text: "Rebuild this screenshot as a working website."
                            },

                            {
                                type: "input_image",
                                image_url: image
                            }
                        ]
                    }
                ],

                text: {
                    format: {
                        type: "json_schema",
                        name: "screenforge_site",
                        strict: true,
                        schema: schema
                    }
                }
            })
        });

        const data = await response.json();

        // OpenAI returned an error
        if (!response.ok) {
            console.error("OpenAI error:", data);

            return json(response.status, {
                error:
                    data?.error?.message ||
                    "OpenAI request failed."
            });
        }

        // Get generated text
        const outputText = extractOutputText(data);

        if (!outputText) {
            return json(502, {
                error: "OpenAI returned no generated code."
            });
        }

        // Convert JSON string into an object
        let result;

        try {
            result = JSON.parse(outputText);
        } catch (error) {
            console.error(
                "Invalid model JSON:",
                outputText
            );

            return json(502, {
                error: "The AI returned invalid website code."
            });
        }

        // Make sure all three files exist
        if (
            typeof result.html !== "string" ||
            typeof result.css !== "string" ||
            typeof result.js !== "string"
        ) {
            return json(502, {
                error:
                    "The AI returned incomplete website code."
            });
        }

        // Send generated website back to ScreenForge
        return json(200, {
            html: result.html,
            css: result.css,
            js: result.js
        });

    } catch (error) {
        console.error(
            "ScreenForge function error:",
            error
        );

        return json(500, {
            error: "Could not reach the AI service."
        });
    }
};
