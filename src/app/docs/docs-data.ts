export type DocSection = {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: DocItem[];
};

export type DocItem = {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  details: string;
  steps: string[];
  config?: { label: string; description: string }[];
  tips?: string[];
  example?: string;
};

export const docSections: DocSection[] = [
  {
    id: "triggers",
    title: "Triggers",
    icon: "⚡",
    description: "Triggers start your workflow. Every workflow needs at least one trigger to begin execution.",
    items: [
      {
        id: "manual-trigger",
        title: "Manual Trigger",
        icon: "🖱️",
        category: "Trigger",
        description: "Runs the workflow when you click the Execute button. Great for testing and one-off tasks.",
        details: "The Manual Trigger is the simplest way to start a workflow. When added to your canvas, it enables the 'Execute Workflow' button at the bottom of the editor. Only one Manual Trigger is allowed per workflow. It passes the current context forward to the next connected node.",
        steps: [
          "Open the workflow editor and click '+ Add Node' in the top-right panel.",
          "Under the 'Triggers' category, select 'Trigger Manually'.",
          "The trigger node appears on the canvas with a right-side handle for connections.",
          "Connect it to any action node by dragging from its output handle.",
          "Click the 'Execute Workflow' button that appears at the bottom center.",
          "Watch the node status indicator change: loading → success/error."
        ],
        tips: [
          "Only one manual trigger is allowed per workflow.",
          "Use this trigger for testing before switching to automated triggers.",
          "The trigger passes an empty context by default — subsequent nodes build on it."
        ]
      },
      {
        id: "schedule-trigger",
        title: "Schedule Trigger",
        icon: "⏰",
        category: "Trigger",
        description: "Runs the workflow automatically at scheduled intervals using Cron expressions.",
        details: "The Schedule Trigger uses Inngest's built-in cron scheduling to execute your workflow at specified intervals. It supports standard cron expressions for flexible scheduling — from every minute to specific days and times.",
        steps: [
          "Add a 'Schedule Trigger' node from the Triggers category.",
          "Double-click the node to open its settings dialog.",
          "Enter a valid cron expression (e.g., '*/5 * * * *' for every 5 minutes).",
          "Save the configuration and connect to downstream nodes.",
          "Deploy or activate the workflow for the schedule to take effect.",
          "The trigger fires automatically at the configured intervals."
        ],
        config: [
          { label: "Cron Expression", description: "Standard cron format: minute hour day month weekday. Example: '0 9 * * 1' = every Monday at 9 AM." }
        ],
        tips: [
          "Use crontab.guru to validate your expressions.",
          "Scheduled triggers only fire when the workflow is active/deployed.",
          "Combine with IF Condition nodes to add date-based logic."
        ]
      },
      {
        id: "google-form-trigger",
        title: "Google Form Trigger",
        icon: "/logos/googleform.svg",
        category: "Trigger",
        description: "Runs the workflow when a Google Form response is submitted.",
        details: "This trigger listens for new Google Form submissions via webhook. When a form is submitted, the response data is passed into the workflow context, making it available for all downstream nodes. You need to configure a Google Forms credential first.",
        steps: [
          "Go to Credentials and add a Google Forms credential with your API key.",
          "Add a 'Google Form Trigger' node to your workflow.",
          "Double-click to configure and link it to your credential.",
          "Enter the Google Form ID you want to monitor.",
          "Connect downstream nodes to process form responses.",
          "Form field values are available via Handlebars: {{fieldName}}."
        ],
        config: [
          { label: "Credential", description: "Select or create a Google Forms credential." },
          { label: "Form ID", description: "The unique ID from your Google Form URL." }
        ],
        tips: [
          "Ensure your Google API credentials have Forms read access.",
          "Test with a manual form submission before going live."
        ]
      },
      {
        id: "stripe-trigger",
        title: "Stripe Trigger",
        icon: "/logos/stripe.svg",
        category: "Trigger",
        description: "Runs the workflow when a Stripe event occurs (payment, subscription, etc.).",
        details: "The Stripe Trigger listens for Stripe webhook events. It supports all standard Stripe events including payment_intent.succeeded, customer.subscription.created, invoice.paid, and more. Event data is injected into the workflow context.",
        steps: [
          "Add a Stripe credential in the Credentials section with your API key.",
          "Add a 'Stripe Trigger' node to your canvas.",
          "Configure the Stripe event types you want to listen for.",
          "Copy the generated webhook URL and add it to your Stripe Dashboard → Developers → Webhooks.",
          "Connect downstream nodes to handle the payment data.",
          "Access event data via Handlebars: {{event.type}}, {{event.data.object.amount}}."
        ],
        config: [
          { label: "Credential", description: "Your Stripe API secret key credential." },
          { label: "Events", description: "Comma-separated Stripe event types to listen for." }
        ],
        tips: [
          "Always verify the webhook signature in production.",
          "Use Stripe CLI for local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe."
        ]
      },
      {
        id: "gmail-trigger",
        title: "Gmail Trigger",
        icon: "/logos/gmail.svg",
        category: "Trigger",
        description: "Runs the workflow when a new email arrives in your Gmail inbox.",
        details: "The Gmail Trigger polls or uses push notifications to detect new emails. It extracts subject, sender, body, and attachment metadata into the workflow context for downstream processing.",
        steps: [
          "Add a Gmail credential via the Credentials page (OAuth2 required).",
          "Add a 'Gmail Trigger' node to your workflow.",
          "Configure the credential and optional label/filter.",
          "Connect action nodes like AI processing or Slack notifications.",
          "Email data is available as: {{subject}}, {{from}}, {{body}}, {{snippet}}."
        ],
        config: [
          { label: "Credential", description: "Gmail OAuth2 credential with read access." },
          { label: "Label/Filter", description: "Optional Gmail label or search query to filter emails." }
        ],
        tips: [
          "Use label filters to avoid processing every single email.",
          "Combine with IF Condition to route emails based on subject or sender."
        ]
      },
      {
        id: "telegram-trigger",
        title: "Telegram Trigger",
        icon: "/logos/telegram.svg",
        category: "Trigger",
        description: "Runs the workflow when a message is received by your Telegram bot.",
        details: "The Telegram Trigger uses the Telegram Bot API webhook mechanism. When a user sends a message to your bot, the message text, chat ID, and user info are injected into the workflow context.",
        steps: [
          "Create a Telegram Bot via @BotFather and get your Bot Token.",
          "Add a Telegram credential with the bot token.",
          "Add a 'Telegram Trigger' node and link the credential.",
          "The webhook URL is auto-registered with Telegram.",
          "Message data available as: {{message.text}}, {{message.chat.id}}, {{message.from.username}}."
        ],
        config: [
          { label: "Credential", description: "Telegram Bot Token from @BotFather." }
        ],
        tips: [
          "Use the Telegram node (action) to send replies back to the same chat.",
          "Access chat.id to route replies to the correct conversation."
        ]
      }
    ]
  },
  {
    id: "ai-nodes",
    title: "AI Nodes",
    icon: "🧠",
    description: "AI nodes let you integrate powerful language models directly into your workflows for text generation, analysis, and more.",
    items: [
      {
        id: "openai",
        title: "OpenAI",
        icon: "/logos/openai.svg",
        category: "AI",
        description: "Send prompts to OpenAI's GPT models and use responses in your workflow.",
        details: "The OpenAI node connects to the OpenAI API (GPT-4, GPT-3.5, etc.). You can use Handlebars templates in your prompts to inject dynamic data from previous nodes. The response is stored in the context under your specified variable name.",
        steps: [
          "Add an OpenAI credential with your API key in Credentials.",
          "Add an 'OpenAI' node to your canvas.",
          "Double-click to configure: select model, enter system prompt and user prompt.",
          "Use Handlebars syntax to inject dynamic data: {{previousNodeVariable}}.",
          "Set the output variable name to store the AI response.",
          "Connect to downstream nodes that use {{yourVariableName}}."
        ],
        config: [
          { label: "Credential", description: "Your OpenAI API key." },
          { label: "Model", description: "GPT model to use (gpt-4, gpt-3.5-turbo, etc.)." },
          { label: "System Prompt", description: "Instructions for the AI's behavior." },
          { label: "User Prompt", description: "The actual question/task. Supports Handlebars." },
          { label: "Variable Name", description: "Context key to store the response." }
        ],
        tips: [
          "Use system prompts to control response format (JSON, markdown, etc.).",
          "Chain multiple AI nodes for complex multi-step reasoning.",
          "Monitor token usage to manage API costs."
        ]
      },
      {
        id: "gemini",
        title: "Gemini",
        icon: "/logos/gemini.svg",
        category: "AI",
        description: "Send prompts to Google's Gemini models for text generation and analysis.",
        details: "The Gemini node integrates Google's Gemini API. It works identically to other AI nodes — configure a prompt with optional Handlebars templates and store the response in a named variable.",
        steps: [
          "Add a Gemini credential with your Google AI API key.",
          "Add a 'Gemini' node to the canvas.",
          "Configure the model, prompt, and output variable name.",
          "Use Handlebars to reference upstream data in your prompt.",
          "The AI response is stored under your variable name for downstream use."
        ],
        config: [
          { label: "Credential", description: "Google AI / Gemini API key." },
          { label: "Model", description: "Gemini model variant." },
          { label: "Prompt", description: "Your prompt with optional Handlebars templates." },
          { label: "Variable Name", description: "Context key to store the response." }
        ],
        tips: ["Gemini excels at multimodal tasks when combined with Document Loader."]
      },
      {
        id: "anthropic",
        title: "Anthropic",
        icon: "/logos/anthropic.svg",
        category: "AI",
        description: "Send prompts to Anthropic's Claude models for thoughtful, detailed responses.",
        details: "The Anthropic node connects to Claude (Claude 3, etc.). It supports system and user prompts with Handlebars templating. Ideal for tasks requiring careful analysis, long-form content, or nuanced reasoning.",
        steps: [
          "Add an Anthropic credential with your API key.",
          "Add an 'Anthropic' node to the canvas.",
          "Configure model, system prompt, user prompt, and output variable.",
          "Connect upstream data sources and downstream consumers.",
          "Access the response via {{yourVariableName}} in later nodes."
        ],
        config: [
          { label: "Credential", description: "Anthropic API key." },
          { label: "Model", description: "Claude model version." },
          { label: "System Prompt", description: "Behavioral instructions for Claude." },
          { label: "User Prompt", description: "The task/question. Supports Handlebars." },
          { label: "Variable Name", description: "Context key for the response." }
        ],
        tips: ["Claude excels at detailed analysis — use it for summarization and classification."]
      }
    ]
  },
  {
    id: "social-media",
    title: "Social Media & Messaging",
    icon: "💬",
    description: "Send messages, notifications, and data to popular communication platforms.",
    items: [
      {
        id: "discord",
        title: "Discord",
        icon: "/logos/discord.svg",
        category: "Messaging",
        description: "Send messages to Discord channels via webhooks.",
        details: "The Discord node sends messages to a specified Discord channel using a webhook URL. You can format messages with Handlebars templates to include dynamic data from your workflow context.",
        steps: [
          "In Discord, go to Server Settings → Integrations → Webhooks → New Webhook.",
          "Copy the webhook URL.",
          "Add a Discord credential in Nodebase with the webhook URL.",
          "Add a 'Discord' node to your workflow canvas.",
          "Configure the message content using Handlebars: 'New order from {{customerName}}'.",
          "Connect a trigger node to fire the Discord message automatically."
        ],
        config: [
          { label: "Credential", description: "Discord webhook URL." },
          { label: "Message", description: "Message content with optional Handlebars templates." }
        ],
        tips: ["Use Discord embeds for richer formatting.", "Test with a private channel first."]
      },
      {
        id: "slack",
        title: "Slack",
        icon: "/logos/slack.svg",
        category: "Messaging",
        description: "Send messages to Slack channels or users.",
        details: "The Slack node sends messages to Slack via a Bot Token or incoming webhook. It supports channel specification and Handlebars-templated messages.",
        steps: [
          "Create a Slack App at api.slack.com/apps and get a Bot Token.",
          "Add a Slack credential in Nodebase.",
          "Add a 'Slack' node to the canvas.",
          "Specify the channel (#general, @user) and message content.",
          "Use Handlebars for dynamic content: '{{alertType}}: {{alertMessage}}'."
        ],
        config: [
          { label: "Credential", description: "Slack Bot Token or webhook URL." },
          { label: "Channel", description: "Target channel or user." },
          { label: "Message", description: "Message text with Handlebars support." }
        ],
        tips: ["Ensure your Slack app has chat:write permission."]
      },
      {
        id: "gmail-action",
        title: "Gmail",
        icon: "/logos/gmail.svg",
        category: "Messaging",
        description: "Send emails via your Gmail account.",
        details: "The Gmail action node sends emails through the Gmail API. Configure recipient, subject, and body — all supporting Handlebars templates for dynamic content from your workflow.",
        steps: [
          "Add a Gmail OAuth2 credential with send permissions.",
          "Add a 'Gmail' node to your workflow.",
          "Configure To, Subject, and Body fields.",
          "Use Handlebars: 'Hello {{customerName}}, your order #{{orderId}} is confirmed.'",
          "Connect to a trigger to automate email sending."
        ],
        config: [
          { label: "Credential", description: "Gmail OAuth2 credential with send scope." },
          { label: "To", description: "Recipient email address." },
          { label: "Subject", description: "Email subject line." },
          { label: "Body", description: "Email body (supports Handlebars)." }
        ],
        tips: ["Be mindful of Gmail's daily sending limits (500/day for free accounts)."]
      },
      {
        id: "telegram-action",
        title: "Telegram",
        icon: "/logos/telegram.svg",
        category: "Messaging",
        description: "Send messages via your Telegram bot to any chat.",
        details: "The Telegram action node sends messages using the Telegram Bot API. Specify the chat ID and message text. Ideal for sending automated notifications and responses.",
        steps: [
          "Ensure you have a Telegram Bot credential configured.",
          "Add a 'Telegram' node to the canvas.",
          "Enter the target Chat ID and message content.",
          "Use Handlebars for dynamic content: 'Alert: {{errorMessage}}'.",
          "Pair with Telegram Trigger for full bot conversations."
        ],
        config: [
          { label: "Credential", description: "Telegram Bot Token." },
          { label: "Chat ID", description: "Target chat/group ID." },
          { label: "Message", description: "Message text with Handlebars support." }
        ],
        tips: ["Get your chat ID by messaging your bot and checking the Telegram API updates endpoint."]
      }
    ]
  },
  {
    id: "rag-nodes",
    title: "RAG (Vector Search)",
    icon: "🔍",
    description: "Build custom chatbots that answer questions based on your own uploaded documents using Retrieval-Augmented Generation.",
    items: [
      {
        id: "text-splitter",
        title: "Text Splitter",
        icon: "✂️",
        category: "RAG",
        description: "Breaks large documents down into smaller semantic chunks to optimize vector similarity searches.",
        details: "Language models have token limits. The Text Splitter takes a large extracted text and intelligently chunks it based on size and overlap parameters, preparing it for Pinecone ingestion.",
        steps: [
          "Extract text using the Document Loader node.",
          "Add a 'Text Splitter' node and reference the Document Loader's output variable.",
          "Set the Chunk Size (e.g., 1000 characters) and Overlap (e.g., 200 characters).",
          "Select the separator strategy (Newline, Sentence, Paragraph).",
          "Output is an array of strings ready for embedding."
        ],
        config: [
          { label: "Variable Name", description: "The variable key to store output. Default: 'myChunks'." },
          { label: "Source Variable", description: "The exact variable containing your large text string (e.g., 'document.text')." },
          { label: "Chunk Size", description: "Maximum number of characters per chunk. Recommended: 1000." },
          { label: "Chunk Overlap", description: "Number of characters to overlap to preserve context. Recommended: 200." },
          { label: "Separator", description: "Defines where the text splits (Newline, Sentence, or Paragraph)." }
        ],
        tips: ["Use 1000 size and 200 overlap as a strong default.", "Connect this to an Insert Pinecone node."]
      },
      {
        id: "insert-pinecone",
        title: "Insert Pinecone",
        icon: "/logos/pinecone.svg",
        category: "RAG",
        description: "Generates vector embeddings for your text chunks and upserts them into a Pinecone database.",
        details: "This node converts an array of text chunks into numerical vectors using OpenAI's text-embedding-3-small model, and then inserts them securely into your Pinecone index.",
        steps: [
          "Create a Pinecone credential securely in the Credentials dashboard.",
          "Add an 'Insert Pinecone' node.",
          "Reference the output chunks variable from the Text Splitter.",
          "Enter your Pinecone Index Name (must be configured to 1536 dimensions).",
          "Execute the node to populate your vector database."
        ],
        config: [
          { label: "Variable Name", description: "The variable key to store the insertion status." },
          { label: "Pinecone Credential", description: "Select your saved Pinecone API key." },
          { label: "Index Name", description: "The exact name of your Pinecone index." },
          { label: "Source Chunks Variable", description: "The output array from Text Splitter (e.g., 'myChunks.chunks')." },
          { label: "OpenAI Credential", description: "Select your saved OpenAI key. This is required to generate the vector embeddings." },
          { label: "Namespace (Optional)", description: "Isolate documents within the same index. Example: 'HR-docs' or 'marketing'." },
          { label: "Embedding Model", description: "Default is 'text-embedding-3-small'." }
        ],
        tips: [
          "CRITICAL: When creating your index in Pinecone, you MUST set the Dimensions to 1536 to match the OpenAI 'text-embedding-3-small' model.",
          "If you choose a different vector size in Pinecone, you will get a 'Vector dimension mismatch' error!",
          "Do NOT type the word 'default' in the Namespace field. If you don't have a specific namespace, leave it completely blank."
        ]
      },
      {
        id: "vector-retriever",
        title: "Vector Retriever",
        icon: "🎯",
        category: "RAG",
        description: "Searches the Pinecone index for the most semantically similar text chunks to a user's query.",
        details: "When a user asks a question, this node embeds their query and performs a similarity search against Pinecone, returning a formatted string of the most relevant context.",
        steps: [
          "Add a 'Vector Retriever' node.",
          "Set the Query Variable (e.g., trigger.message) containing the user's question.",
          "Select your Pinecone credential and Index Name.",
          "Set the Top K limit (how many chunks to retrieve).",
          "The output is a single formatted string of context."
        ],
        config: [
          { label: "Variable Name", description: "The variable key to store the output context. Default: 'retrieval'." },
          { label: "Pinecone Credential", description: "Select your saved Pinecone API key." },
          { label: "Index Name", description: "The exact name of your Pinecone index." },
          { label: "Namespace (Optional)", description: "The specific namespace to search within." },
          { label: "Query Variable", description: "The dynamic variable with the user's question (e.g., 'trigger.message')." },
          { label: "Top K Results", description: "Number of most relevant chunks to retrieve (1-20). Default: 5." },
          { label: "OpenAI Credential", description: "Select your saved OpenAI key for generating the query embedding." },
          { label: "Embedding Model", description: "Must match the model used for insertion. Default: 'text-embedding-3-small'." }
        ],
        tips: [
          "CRITICAL: The Query Variable must match your trigger! For Telegram triggers, type exactly 'telegram_message' (not 'trigger.message').",
          "CRITICAL: Leave the Namespace field completely blank if you left it blank during the Insert Pinecone step.",
          "Ensure your Pinecone Index dimensions match the Embedding Model (1536 for OpenAI)."
        ]
      },
      {
        id: "rag-agent",
        title: "RAG Agent",
        icon: "🤖",
        category: "RAG",
        description: "Combines retrieved context with an AI model to generate highly accurate, context-aware answers.",
        details: "The intelligence layer of the RAG pipeline. It builds a structured prompt containing the user's query, the retrieved context from Pinecone, and any previous chat history, and sends it to OpenAI.",
        steps: [
          "Add a 'RAG Agent' node.",
          "Map the Query Variable (the user's question) and the Context Variable (output from Vector Retriever).",
          "Optionally map the Chat History Variable from the Chat Memory node.",
          "Select the OpenAI model (e.g., GPT-4o).",
          "The node returns the final synthesized answer."
        ],
        config: [
          { label: "Variable Name", description: "The variable key to store the AI response. Default: 'aiResponse'." },
          { label: "OpenAI Credential", description: "Select your saved OpenAI key for generation." },
          { label: "Model", description: "The LLM to use (e.g., GPT-4o Mini)." },
          { label: "Context Variable", description: "The retrieved text from Vector Retriever (e.g., 'retrieval.context')." },
          { label: "Query Variable", description: "The user's question (e.g., 'trigger.message')." },
          { label: "Chat History Variable (Optional)", description: "The history output from Chat Memory (e.g., 'chatMem.history')." },
          { label: "System Prompt", description: "Custom instructions for the AI (e.g., 'Always cite your sources.')." },
          { label: "Temperature", description: "Creativity of the response. Default: 0.7." }
        ],
        tips: [
          "CRITICAL: Your Query Variable here MUST exactly match the Query Variable in your Vector Retriever (e.g., 'telegram_message' for Telegram).",
          "If the context is empty, the RAG agent will gracefully tell the user it doesn't have enough information.",
          "If the Query Variable isn't found, you can type a static question directly into the field for testing."
        ]
      },
      {
        id: "chat-memory",
        title: "Chat Memory",
        icon: "🧠",
        category: "RAG",
        description: "Manages multi-turn conversation state to give your AI agents conversational memory.",
        details: "Stores and retrieves previous chat messages for a specific session ID, preventing the AI from losing track of the conversation.",
        steps: [
          "Add a 'Chat Memory' node before your Retriever/Agent.",
          "Provide a Session ID (e.g., trigger.chatId).",
          "Set the Max Messages limit to prevent blowing up the LLM token context window.",
          "Map the output history into the RAG Agent's Chat History Variable."
        ],
        config: [
          { label: "Variable Name", description: "The variable key to store the formatted history. Default: 'chatMem'." },
          { label: "Session ID", description: "Unique identifier for the user (e.g., 'trigger.chatId' or 'user.id')." },
          { label: "Max Messages", description: "Sliding window limit for recent messages. Default: 10." }
        ],
        tips: [
          "CRITICAL: The Session ID must match your trigger! For Telegram triggers, type exactly 'telegram_chat_id' (not 'trigger.chatId').",
          "For manual testing, type a static string like 'test-session-1' into the Session ID field.",
          "This node should run BEFORE the RAG Agent so the history is ready to be consumed."
        ]
      }
    ]
  },
  {
    id: "developer-tools",
    title: "Developer Tools",
    icon: "🛠️",
    description: "Logic and integration nodes for building powerful, conditional, data-driven workflows.",
    items: [
      {
        id: "http-request",
        title: "HTTP Request",
        icon: "🌐",
        category: "Developer",
        description: "Make HTTP requests to any external API (GET, POST, PUT, DELETE, PATCH).",
        details: "The HTTP Request node is one of the most powerful nodes. It can call any REST API. The endpoint and request body support Handlebars templates, so you can inject dynamic data. Responses are parsed automatically (JSON or text) and stored in the context.",
        steps: [
          "Add an 'HTTP Request' node to your workflow canvas.",
          "Double-click to open the configuration dialog.",
          "Set the Variable Name — this is the key where the response is stored in context.",
          "Enter the API Endpoint URL (supports Handlebars: 'https://api.example.com/users/{{userId}}').",
          "Select the HTTP Method (GET, POST, PUT, DELETE, PATCH).",
          "For POST/PUT/PATCH, add a JSON Body (supports Handlebars templates).",
          "The response is stored as: {{variableName.httpResponse.data}}."
        ],
        config: [
          { label: "Variable Name", description: "Context key to store the response. Required." },
          { label: "Endpoint", description: "Full URL. Supports Handlebars: https://api.com/{{id}}" },
          { label: "Method", description: "HTTP method: GET, POST, PUT, DELETE, PATCH." },
          { label: "Body", description: "JSON body for POST/PUT/PATCH. Supports Handlebars." }
        ],
        example: "// Access response data in downstream nodes:\n// {{myApi.httpResponse.status}} → 200\n// {{myApi.httpResponse.data}} → response body\n// {{myApi.httpResponse.statusText}} → \"OK\"",
        tips: [
          "Use the Handlebars {{json variable}} helper for complex JSON bodies.",
          "Responses with Content-Type: application/json are auto-parsed.",
          "Chain multiple HTTP nodes for multi-API orchestration."
        ]
      },
      {
        id: "if-condition",
        title: "IF Condition",
        icon: "🔀",
        category: "Developer",
        description: "Branch your workflow based on conditional logic.",
        details: "The IF Condition node evaluates an expression and routes the workflow to either the 'true' or 'false' branch. It supports operators: EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, GREATER_THAN, LESS_THAN. Both the variable and value fields support Handlebars.",
        steps: [
          "Add an 'IF Condition' node to the canvas.",
          "Double-click to open the settings dialog.",
          "Enter the Variable to Check (Handlebars expression, e.g., '{{email_subject}}').",
          "Select an Operator (Equals, Contains, Greater Than, etc.).",
          "Enter the comparison Value (e.g., 'Urgent').",
          "Connect the 'true' output handle to the success path.",
          "Connect the 'false' output handle to the alternative path."
        ],
        config: [
          { label: "Variable", description: "Handlebars expression to evaluate. E.g., {{status}}" },
          { label: "Operator", description: "EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, GREATER_THAN, LESS_THAN" },
          { label: "Value", description: "The value to compare against. Supports Handlebars." }
        ],
        example: "// Example: Route based on payment amount\n// Variable: {{payment.amount}}\n// Operator: GREATER_THAN\n// Value: 1000\n// True → Send to manager | False → Auto-approve",
        tips: [
          "The node has two output handles: 'true' and 'false'.",
          "GREATER_THAN and LESS_THAN parse values as numbers.",
          "Chain multiple IF Conditions for complex decision trees."
        ]
      }
    ]
  },
  {
    id: "data-nodes",
    title: "Data",
    icon: "📄",
    description: "Load, transform, and process data within your workflows.",
    items: [
      {
        id: "document-loader",
        title: "Document Loader",
        icon: "/logos/document.svg",
        category: "Data",
        description: "Load documents (PDF, DOCX, TXT, CSV) for AI processing.",
        details: "The Document Loader extracts text content from uploaded documents and makes it available in the workflow context. This is especially powerful when chained with AI nodes for summarization, analysis, or data extraction.",
        steps: [
          "Add a 'Document Loader' node to your workflow.",
          "Double-click to configure and upload or link a document.",
          "Supported formats: PDF, DOCX, TXT, CSV.",
          "The extracted text is stored in the context under the configured variable.",
          "Connect to an AI node and reference the document: {{documentContent}}.",
          "Chain with IF Condition for content-based routing."
        ],
        config: [
          { label: "Document", description: "Upload or link the document file." },
          { label: "Variable Name", description: "Context key for extracted content." }
        ],
        tips: [
          "Large PDFs may be truncated — check your AI model's token limits.",
          "CSV files are converted to structured text for AI consumption.",
          "Combine with Gemini for multimodal document analysis."
        ]
      }
    ]
  },
  {
    id: "concepts",
    title: "Core Concepts",
    icon: "📚",
    description: "Understand the fundamental building blocks of Nodebase.",
    items: [
      {
        id: "workflows",
        title: "Workflows",
        icon: "🔄",
        category: "Concept",
        description: "A workflow is a visual automation pipeline made of connected nodes.",
        details: "Workflows are the core unit of automation in Nodebase. Each workflow is a directed graph of nodes connected by edges. Execution flows from trigger nodes through action nodes in topological order. Workflows can be saved, activated, and monitored.",
        steps: [
          "Navigate to the Workflows page from the sidebar.",
          "Click 'New Workflow' to create a new automation.",
          "You're taken to the visual editor with an empty canvas.",
          "Add a trigger node first (every workflow needs one).",
          "Add action nodes and connect them by dragging between handles.",
          "Use the editor header to rename, save, or toggle active state.",
          "Monitor executions from the Executions page."
        ],
        tips: [
          "Workflows auto-save your node positions and connections.",
          "Each workflow has a unique ID used for API references.",
          "Use descriptive names for easy identification."
        ]
      },
      {
        id: "credentials",
        title: "Credentials",
        icon: "🔑",
        category: "Concept",
        description: "Securely store API keys, tokens, and OAuth credentials for your integrations.",
        details: "Credentials are encrypted secrets stored in your account. They are referenced by nodes that need authentication (Gmail, Slack, OpenAI, etc.). Credentials are encrypted at rest and never exposed in the UI after creation. Each credential is scoped to your user account.",
        steps: [
          "Navigate to Credentials from the sidebar.",
          "Click 'New Credential' and select the service type.",
          "Enter the required fields (API key, OAuth tokens, webhook URLs, etc.).",
          "Save — the credential is encrypted and stored securely.",
          "When configuring a node, select the credential from the dropdown.",
          "Credentials can be reused across multiple workflows."
        ],
        tips: [
          "Credentials are encrypted using AES — never stored in plaintext.",
          "Rotate your API keys regularly for security.",
          "One credential can be shared across multiple workflows."
        ]
      },
      {
        id: "executions",
        title: "Executions",
        icon: "📊",
        category: "Concept",
        description: "Monitor and debug your workflow runs with detailed execution logs.",
        details: "Every workflow run creates an Execution record. Executions track status (PENDING, SUCCESS, FAILED), output data, error messages, and timing. You can view execution history, inspect outputs, and debug failures from the Executions page.",
        steps: [
          "Navigate to Executions from the sidebar.",
          "View all past workflow runs with their status.",
          "Click an execution to see detailed output and timing.",
          "Failed executions show error messages and stack traces.",
          "Use this data to debug and optimize your workflows.",
          "Executions are linked to their source workflow for easy navigation."
        ],
        tips: [
          "Failed executions retry up to 3 times in production.",
          "Check the error stack trace for debugging failed nodes.",
          "Execution data includes the full output context."
        ]
      },
      {
        id: "handlebars",
        title: "Handlebars Templating",
        icon: "🏷️",
        category: "Concept",
        description: "Use {{variables}} to pass dynamic data between nodes in your workflow.",
        details: "Nodebase uses Handlebars templating throughout. Any text field that supports dynamic data uses the {{variableName}} syntax. Data flows through the workflow context — each node can read from and write to this shared context. Use the special {{json variable}} helper for complex objects.",
        steps: [
          "When configuring a node, use {{variableName}} to reference context data.",
          "Data is set by upstream nodes (e.g., HTTP Request stores response as {{myApi}}).",
          "Access nested properties: {{myApi.httpResponse.data.name}}.",
          "Use the {{json variable}} helper to output full JSON objects.",
          "Variables are resolved at execution time with actual data.",
          "Chain nodes to build up a rich context for downstream consumption."
        ],
        example: "// Setting data (HTTP Request node):\n// Variable Name: weatherData\n// → stores response as context.weatherData\n\n// Reading data (Slack message):\n// \"Current temp: {{weatherData.httpResponse.data.temp}}°F\"\n\n// JSON helper (POST body):\n// {\"payload\": {{json previousResult}}}",
        tips: [
          "Variable names are case-sensitive.",
          "Missing variables render as empty strings (no errors).",
          "Use the json helper when passing objects in JSON bodies."
        ]
      }
    ]
  }
];
