export const generateGmailTriggerScript = (webhookUrl: string) => {
  return `/**
 * Google Apps Script to forward new emails to n8n-clone via webhook.
 * Set this to run on a time-driven trigger (e.g., every 1 minute).
 */

function checkNewEmailsAndSendToWebhook() {
  var webhookUrl = "${webhookUrl}";
  
  // Search for unread emails in Inbox. You can customize the query!
  var threads = GmailApp.search('is:unread in:inbox', 0, 10);
  
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      
      // Check if message is unread
      if (message.isUnread()) {
        var payload = {
          messageId: message.getId(),
          from: message.getFrom(),
          to: message.getTo(),
          subject: message.getSubject(),
          date: message.getDate().toISOString(),
          plainBody: message.getPlainBody(),
        };
        
        var options = {
          'method' : 'post',
          'contentType': 'application/json',
          'payload' : JSON.stringify(payload)
        };
        
        try {
          UrlFetchApp.fetch(webhookUrl, options);
          // Mark as read so we don't process it again
          message.markRead();
        } catch (e) {
          Logger.log("Failed to send webhook: " + e.toString());
        }
      }
    }
  }
}
`;
};
