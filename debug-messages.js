// Paste this in your browser console to see the actual message content
// This will help us debug what's being stored

const checkMessages = () => {
  // Open IndexedDB
  const request = indexedDB.open('ConversationDB', 2);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['conversations'], 'readonly');
    const store = transaction.objectStore('conversations');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const conversations = getAllRequest.result;
      console.log('=== ALL CONVERSATIONS ===');
      conversations.forEach(conv => {
        console.log(`\nConversation: ${conv.title}`);
        conv.messages.forEach((msg, idx) => {
          console.log(`\nMessage ${idx} (${msg.role}):`);
          console.log('Content type:', typeof msg.content);
          console.log('Content:', msg.content);
          console.log('First 100 chars:', msg.content?.substring(0, 100));
        });
      });
    };
  };
};

checkMessages();
