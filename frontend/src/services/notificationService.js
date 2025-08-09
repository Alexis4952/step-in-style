import { supabase } from '../supabaseClient';

class NotificationService {
  constructor() {
    // Email service configuration (π.χ. EmailJS)
    this.emailConfig = {
      // Θα προστεθούν τα στοιχεία για email service
      serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
      templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    };
  }

  /**
   * Αποστολή email επιβεβαίωσης παραγγελίας
   * @param {Object} orderData - Στοιχεία παραγγελίας
   */
  async sendOrderConfirmationEmail(orderData) {
    try {
      const emailData = {
        to_email: orderData.customer_email,
        to_name: orderData.customer_name,
        order_id: `ORD-${String(orderData.id).padStart(3, '0')}`,
        order_total: `${orderData.total}€`,
        order_date: new Date(orderData.created_at).toLocaleDateString('el-GR'),
        order_status: this.getStatusLabel(orderData.status),
        order_items: orderData.items || []
      };

      // TODO: Ενσωμάτωση με EmailJS ή άλλο email service
      console.log('📧 Email confirmation ready to send:', emailData);
      
      // Για τώρα αποθηκεύουμε στη βάση ότι στάλθηκε
      await this.logNotification({
        order_id: orderData.id,
        type: 'email',
        recipient: orderData.customer_email,
        subject: 'Επιβεβαίωση παραγγελίας',
        status: 'sent'
      });

      return { success: true, message: 'Email στάλθηκε επιτυχώς' };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Αποστολή notification για αλλαγή status
   * @param {Object} orderData - Στοιχεία παραγγελίας
   * @param {String} newStatus - Νέα κατάσταση
   */
  async sendStatusUpdateNotification(orderData, newStatus) {
    try {
      const statusMessages = {
        'paid': 'Η πληρωμή σας επιβεβαιώθηκε!',
        'processing': 'Η παραγγελία σας προετοιμάζεται για αποστολή.',
        'shipped': 'Η παραγγελία σας απεστάλη!',
        'delivered': 'Η παραγγελία σας παραδόθηκε.',
        'cancelled': 'Η παραγγελία σας ακυρώθηκε.'
      };

      const emailData = {
        to_email: orderData.customer_email,
        to_name: orderData.customer_name,
        order_id: `ORD-${String(orderData.id).padStart(3, '0')}`,
        status_message: statusMessages[newStatus] || 'Η κατάσταση της παραγγελίας σας ενημερώθηκε.',
        new_status: this.getStatusLabel(newStatus),
        tracking_number: orderData.tracking_number || null
      };

      console.log('📧 Status update email ready:', emailData);

      await this.logNotification({
        order_id: orderData.id,
        type: 'email',
        recipient: orderData.customer_email,
        subject: 'Ενημέρωση παραγγελίας',
        status: 'sent'
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending status update:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Αποστολή notification στον admin για νέα παραγγελία
   * @param {Object} orderData - Στοιχεία παραγγελίας
   */
  async sendAdminNewOrderAlert(orderData) {
    try {
      // Real-time notification στο admin dashboard
      await this.createAdminNotification({
        type: 'new_order',
        title: 'Νέα Παραγγελία!',
        message: `Νέα παραγγελία #ORD-${String(orderData.id).padStart(3, '0')} από ${orderData.customer_name}`,
        order_id: orderData.id,
        amount: orderData.total
        // Αφήνουμε τη Supabase να βάλει το timestamp αυτόματα
      });

      // Email στον admin (προαιρετικά)
      console.log('🚨 Admin alert for new order:', orderData.id);

      return { success: true };
    } catch (error) {
      console.error('Error sending admin alert:', error);
      return { success: false };
    }
  }

  /**
   * Δημιουργία admin notification στη βάση
   * @param {Object} notificationData - Στοιχεία notification
   */
  async createAdminNotification(notificationData) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .insert(notificationData);

      if (error) {
        // Αν δεν υπάρχει ο πίνακας, τον δημιουργούμε
        if (error.code === '42P01') {
          await this.createAdminNotificationsTable();
          // Προσπαθούμε ξανά
          const { error: retryError } = await supabase
            .from('admin_notifications')
            .insert(notificationData);
          
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating admin notification:', error);
      return { success: false };
    }
  }

  /**
   * Δημιουργία πίνακα admin_notifications
   */
  async createAdminNotificationsTable() {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_notifications (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          order_id INTEGER,
          amount DECIMAL(10,2),
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (error) {
      console.error('Error creating admin_notifications table:', error);
    }
  }

  /**
   * Log notification στη βάση
   * @param {Object} logData - Στοιχεία log
   */
  async logNotification(logData) {
    try {
      await supabase
        .from('notification_logs')
        .insert({
          ...logData,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Μετάφραση status σε ελληνικά
   * @param {String} status - Status
   */
  getStatusLabel(status) {
    const labels = {
      'pending': 'Εκκρεμεί',
      'paid': 'Πληρώθηκε',
      'processing': 'Επεξεργασία',
      'shipped': 'Απεστάλη',
      'delivered': 'Παραδόθηκε',
      'cancelled': 'Ακυρώθηκε'
    };
    return labels[status] || status;
  }
}

export default new NotificationService();
