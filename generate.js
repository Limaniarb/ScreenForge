"use strict";
const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const schema = {type:"object",additionalProperties:false,properties:{html:{type:"string"},css:{type:"string"},js:{type:"string"}},required:["html","css","js"]};
function json(statusCode, body){return {statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)};}
function extractOutputText(data){if(typeof data?.output_text==="string"&&data.output_text.trim())return data.output_text.trim();const pieces=[];for(const item of data?.output||[])for(const content of item?.content||[])if(typeof content?.text==="string")pieces.push(content.text);return pieces.join("\n").trim();}
exports.handler=async function(event){
 if(event.httpMethod!=="POST")return json(405,{error:"Method not allowed"});
 const apiKey=process.env.OPENAI_API_KEY;
 if(!apiKey)return json(500,{error:"OPENAI_API_KEY is not configured on Netlify."});
 let body; try{body=JSON.parse(event.body||"{}");}catch{return json(400,{error:"Invalid request body."});}
 const image=body?.image; const options=body?.options||{};
 if(typeof image!=="string"||!image.startsWith("data:image/"))return json(400,{error:"A valid screenshot is required."});
 const prompt=`You are ScreenForge, a production-quality screenshot-to-website generator.\n\nInspect the supplied screenshot and recreate the visible interface as accurately as possible using semantic HTML, modern CSS, and small vanilla JavaScript only.\n\nRules:\n- Return only the JSON object matching the provided schema.\n- The screenshot is the source of truth for layout, spacing, hierarchy, colors, typography, borders, shadows, imagery, and responsive behavior.\n- Recreate the actual visual structure instead of inventing an unrelated design.\n- Do not create a generic template.\n- Use semantic HTML elements.\n- Put all styling in CSS and behavior in vanilla JavaScript.\n- Do not use React, Vue, Angular, Tailwind, Bootstrap, jQuery, or external component libraries.\n- Do not load external images. Use CSS shapes or inline SVG for simple icons.\n- Make the result responsive.\n- Keep the code clean and production-ready.\n- The HTML field must contain body markup only; do not include html/head/body tags.\n- Do not put CSS or JavaScript inside the HTML field.\n- Match the screenshot instead of applying your own unrelated design.\n\nUser options:\n- Responsive layout: ${options.responsive?"yes":"no"}\n- Modernize UI: ${options.modernize?"yes, but preserve the screenshot structure":"no"}\n- Animations: ${options.animations?"yes, subtle only":"no"}`;
 try{
  const response=await fetch(OPENAI_URL,{method:"POST",headers:{"Content-Type":"application/json","Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:MODEL,instructions:prompt,input:[{role:"user",content:[{type:"input_text",text:"Rebuild this screenshot as a working website."},{type:"input_image",image_url:image}]}],text:{format:{type:"json_schema",name:"screenforge_site",strict:true,schema}}})});
  const data=await response.json();
  if(!response.ok){console.error("OpenAI error:",data);return json(response.status,{error:data?.error?.message||"OpenAI request failed."});}
  const outputText=extractOutputText(data); if(!outputText)return json(502,{error:"OpenAI returned no generated code."});
  let result; try{result=JSON.parse(outputText);}catch{console.error("Invalid model JSON:",outputText);return json(502,{error:"The AI returned invalid website code."});}
  if(typeof result.html!=="string"||typeof result.css!=="string"||typeof result.js!=="string")return json(502,{error:"The AI returned incomplete website code."});
  return json(200,result);
 }catch(error){console.error("ScreenForge function error:",error);return json(500,{error:"Could not reach the AI service."});}
};
