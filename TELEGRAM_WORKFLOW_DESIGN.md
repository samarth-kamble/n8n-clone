# Telegram Document Analysis Workflow

## Workflow Overview
This workflow allows users to send messages to a Telegram bot, which then analyzes documents using Gemini AI and sends the results back to the user.

## Workflow Nodes

### 1. Telegram Trigger
**Type:** `TELEGRAM_TRIGGER`
**Purpose:** Receives incoming messages from Telegram users
**Output Variables:**
- `{{telegramTrigger.message}}` - The message text from user
- `{{telegramTrigger.chatId}}` - The sender's chat ID (used to reply)
- `{{telegramTrigger.from}}` - Sender information
- `{{telegramTrigger.messageId}}` - Message ID

**Configuration:**
- Set up webhook URL: `https://your-domain.com/api/webhooks/telegram-trigger?workflowId=YOUR_WORKFLOW_ID`
- Configure bot token via BotFather

---

### 2. Document Loader
**Type:** `DOCUMENT_LOADER`
**Purpose:** Loads and extracts text from documents
**Configuration:**
- **Variable Name:** `documentContent`
- **Document Source:** Select from uploaded documents or use a document ID
- **Output:** `{{documentContent.text}}` - Extracted text from the document

**Use Case:** Load a knowledge base document, FAQ, or any reference material that Gemini will analyze

---

### 3. Gemini AI
**Type:** `GEMINI`
**Purpose:** Processes the document content and user's message using Google's Gemini AI
**Configuration:**
- **Variable Name:** `geminiResponse`
- **Credential:** Select your Gemini API credential
- **Prompt Template:**
```
You are a helpful assistant analyzing documents for users.

Document Content:
{{documentContent.text}}

User Question:
{{telegramTrigger.message}}

Please provide a clear and concise answer based on the document content above.
```
- **Model:** `gemini-1.5-flash` or `gemini-1.5-pro`
- **Temperature:** 0.7
- **Max Tokens:** 1000

**Output:** `{{geminiResponse.text}}` - AI-generated response

---

### 4. Telegram Send Message
**Type:** `TELEGRAM`
**Purpose:** Sends the AI response back to the user who triggered the workflow
**Configuration:**
- **Variable Name:** `telegramReply`
- **Bot Token:** Same token used in the trigger
- **Chat ID:** `{{telegramTrigger.chatId}}` (replies to the sender)
- **Message Template:**
```
🤖 AI Analysis Result:

{{geminiResponse.text}}

---
Powered by Gemini AI
```

**Output:** `{{telegramReply.messageId}}` - Sent message ID

---

## Workflow Flow Diagram

```
┌─────────────────────┐
│  Telegram Trigger   │
│  (User sends msg)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Document Loader    │
│  (Load knowledge)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Gemini AI        │
│  (Analyze & Reply)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Telegram Send      │
│  (Send response)    │
└─────────────────────┘
```

---

## Setup Instructions

### Step 1: Create Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow instructions
3. Copy the bot token (e.g., `123456:ABC-DEF...`)
4. Save the token - you'll need it for both trigger and send nodes

### Step 2: Upload Document
1. Go to your workflow dashboard
2. Navigate to Documents section
3. Upload your knowledge base document (PDF, DOCX, TXT)
4. Note the document ID or name

### Step 3: Configure Gemini Credential
1. Go to Credentials section
2. Create new Gemini credential
3. Add your Google AI API key
4. Get API key from: https://makersuite.google.com/app/apikey

### Step 4: Build the Workflow
1. Add **Telegram Trigger** node
   - Copy the webhook URL
   - Set up webhook using the "Copy Setup Command" button
   - Replace `<BOT_TOKEN>` with your actual bot token
   - Run the curl command in terminal

2. Add **Document Loader** node
   - Connect from Telegram Trigger
   - Select your uploaded document
   - Set variable name: `documentContent`

3. Add **Gemini AI** node
   - Connect from Document Loader
   - Select Gemini credential
   - Use the prompt template above
   - Set variable name: `geminiResponse`

4. Add **Telegram Send** node
   - Connect from Gemini AI
   - Enter bot token
   - Set Chat ID: `{{telegramTrigger.chatId}}`
   - Use the message template above
   - Set variable name: `telegramReply`

### Step 5: Test the Workflow
1. Save the workflow
2. Open Telegram and find your bot
3. Send `/start` to initiate conversation
4. Send any question related to your document
5. Bot should respond with AI-generated answer

---

## Example Use Cases

### 1. Customer Support Bot
- **Document:** Product FAQ, user manual
- **User asks:** "How do I reset my password?"
- **Bot replies:** AI-generated answer from the FAQ

### 2. Knowledge Base Assistant
- **Document:** Company policies, procedures
- **User asks:** "What's the vacation policy?"
- **Bot replies:** Relevant policy information

### 3. Document Q&A
- **Document:** Research paper, article
- **User asks:** "Summarize the key findings"
- **Bot replies:** AI-generated summary

---

## Advanced Customization

### Multiple Documents
Add multiple Document Loader nodes and combine them:
```
Prompt: 
Document 1: {{doc1.text}}
Document 2: {{doc2.text}}

User Question: {{telegramTrigger.message}}
```

### Conditional Responses
Add an IF_CONDITION node to route different types of questions:
- Technical questions → Technical document
- Billing questions → Billing document

### Error Handling
Add error messages in Telegram Send node:
```
{{#if geminiResponse.text}}
  {{geminiResponse.text}}
{{else}}
  Sorry, I couldn't process your request. Please try again.
{{/if}}
```

---

## Troubleshooting

### Bot doesn't respond
- Check webhook is set correctly: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Verify workflow is saved and active
- Check execution logs for errors

### "Forbidden: bots can't send messages to bots"
- Make sure Chat ID is `{{telegramTrigger.chatId}}`, not the bot's ID
- User must start conversation with bot first (`/start`)

### Document not loading
- Verify document is uploaded and accessible
- Check document format is supported (PDF, DOCX, TXT)

### Gemini API errors
- Verify API key is valid
- Check API quota limits
- Ensure prompt isn't too long (max context window)

---

## Cost Considerations

- **Telegram API:** Free
- **Gemini API:** Pay per token (check Google AI pricing)
- **Document Storage:** Depends on your hosting

**Estimated cost per interaction:**
- Document: ~500 tokens
- User message: ~50 tokens
- Response: ~200 tokens
- Total: ~750 tokens ≈ $0.001 per interaction (Gemini Flash)

---

## Next Steps

1. Implement the workflow following the steps above
2. Test with sample questions
3. Monitor execution logs
4. Optimize prompt for better responses
5. Add more documents or features as needed
