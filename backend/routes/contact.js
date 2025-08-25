const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// File-based storage paths
const MESSAGES_FILE = path.join(__dirname, '../data/contact_messages.json');
const NOTIFICATIONS_FILE = path.join(__dirname, '../data/admin_notifications.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(__dirname, '../data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
};

// Helper functions for file operations
const readMessages = async () => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeMessages = async (messages) => {
  await ensureDataDir();
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

const readNotifications = async () => {
  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeNotifications = async (notifications) => {
  await ensureDataDir();
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
};

// POST /api/contact - Υποβολή φόρμας επικοινωνίας
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Μη έγκυρη διεύθυνση email'
      });
    }

    // Read existing messages
    const messages = await readMessages();
    
    // Create new message
    const contactId = Date.now();
    const newMessage = {
      id: contactId,
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      status: 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to messages array
    messages.push(newMessage);
    await writeMessages(messages);

    // Create admin notification
    try {
      const notifications = await readNotifications();
      const newNotification = {
        id: Date.now() + 1,
        title: 'Νέο Μήνυμα Επικοινωνίας',
        message: `Νέο μήνυμα από ${name} - ${subject || 'Χωρίς θέμα'}`,
        type: 'new_contact_message',
        read: false,
        contact_message_id: contactId,
        order_id: null,
        amount: null,
        created_at: new Date().toISOString()
      };
      
      notifications.push(newNotification);
      await writeNotifications(notifications);
    } catch (notificationError) {
      console.error('Σφάλμα κατά τη δημιουργία ειδοποίησης:', notificationError);
    }

    console.log('✅ ΝΕΟ ΜΗΝΥΜΑ ΕΠΙΚΟΙΝΩΝΙΑΣ:');
    console.log('📧 Email:', email);
    console.log('👤 Όνομα:', name);
    console.log('📞 Τηλέφωνο:', phone || 'Δεν δόθηκε');
    console.log('📋 Θέμα:', subject || 'Χωρίς θέμα');
    console.log('💬 Μήνυμα:', message);
    console.log('🆔 ID:', contactId);
    console.log('─'.repeat(50));

    res.status(201).json({
      success: true,
      message: 'Το μήνυμά σας στάλθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό.',
      messageId: contactId
    });

  } catch (error) {
    console.error('Σφάλμα κατά την αποθήκευση μηνύματος επικοινωνίας:', error);
    res.status(500).json({
      success: false,
      error: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.'
    });
  }
});

// GET /api/contact - Ανάκτηση μηνυμάτων για admin panel
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search = '' } = req.query;
    
    let messages = await readMessages();
    
    // Filter by status
    if (status && status !== 'all') {
      messages = messages.filter(msg => msg.status === status);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      messages = messages.filter(msg => 
        msg.name.toLowerCase().includes(searchLower) ||
        msg.email.toLowerCase().includes(searchLower) ||
        (msg.subject && msg.subject.toLowerCase().includes(searchLower)) ||
        msg.message.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created_at (newest first)
    messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = messages.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      messages: paginatedMessages,
      total: messages.length,
      page: parseInt(page),
      totalPages: Math.ceil(messages.length / limit)
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ανάκτηση μηνυμάτων:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ανάκτηση των μηνυμάτων'
    });
  }
});

// PUT /api/contact/:id - Ενημέρωση στάτους μηνύματος
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const messages = await readMessages();
    const messageIndex = messages.findIndex(msg => msg.id == id);
    
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Το μήνυμα δεν βρέθηκε'
      });
    }
    
    messages[messageIndex].status = status;
    messages[messageIndex].updated_at = new Date().toISOString();
    
    await writeMessages(messages);
    
    res.json({
      success: true,
      message: 'Το στάτους του μηνύματος ενημερώθηκε επιτυχώς'
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση μηνύματος:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ενημέρωση του μηνύματος'
    });
  }
});

// DELETE /api/contact/:id - Διαγραφή μηνύματος
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const messages = await readMessages();
    const filteredMessages = messages.filter(msg => msg.id != id);
    
    if (messages.length === filteredMessages.length) {
      return res.status(404).json({
        success: false,
        error: 'Το μήνυμα δεν βρέθηκε'
      });
    }
    
    await writeMessages(filteredMessages);
    
    res.json({
      success: true,
      message: 'Το μήνυμα διαγράφηκε επιτυχώς'
    });
  } catch (error) {
    console.error('Σφάλμα κατά τη διαγραφή μηνύματος:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά τη διαγραφή του μηνύματος'
    });
  }
});

// GET /api/contact/notifications - Ανάκτηση ειδοποιήσεων για admin
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await readNotifications();
    
    // Sort by created_at (newest first)
    notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ανάκτηση ειδοποιήσεων:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ανάκτηση των ειδοποιήσεων'
    });
  }
});

// PUT /api/contact/notifications/:id/read - Σημείωση notification ως διαβασμένο
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notifications = await readNotifications();
    const notificationIndex = notifications.findIndex(n => n.id == id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Η ειδοποίηση δεν βρέθηκε'
      });
    }
    
    notifications[notificationIndex].read = true;
    await writeNotifications(notifications);
    
    res.json({
      success: true,
      message: 'Η ειδοποίηση σημειώθηκε ως διαβασμένη'
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση ειδοποίησης:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ενημέρωση της ειδοποίησης'
    });
  }
});

module.exports = router;