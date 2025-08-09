import { supabase } from '../supabaseClient';

class PaymentService {
  constructor() {
    // myPOS configuration (θα προστεθούν τα πραγματικά στοιχεία αργότερα)
    this.config = {
      // Θα προστεθούν από τη myPOS:
      // merchantId: 'YOUR_MERCHANT_ID',
      // apiKey: 'YOUR_API_KEY', 
      // testMode: true/false,
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://www.mypos.com/vmp/checkout' 
        : 'https://www.mypos.com/vmp/checkout-test'
    };
  }

  /**
   * Δημιουργία payment URL για myPOS
   * @param {Object} orderData - Στοιχεία παραγγελίας
   * @returns {String} Payment URL
   */
  async createPaymentUrl(orderData) {
    try {
      // Προετοιμασία για myPOS integration
      const paymentParams = {
        // Βασικά στοιχεία που θέλει η myPOS:
        order_id: orderData.orderId,
        amount: Math.round(orderData.total * 100), // σε λεπτά
        currency: 'EUR',
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        description: `Παραγγελία #ORD-${String(orderData.orderId).padStart(3, '0')}`,
        
        // URLs για επιστροφή
        success_url: `${window.location.origin}/payment-success?order_id=${orderData.orderId}`,
        cancel_url: `${window.location.origin}/payment-cancel?order_id=${orderData.orderId}`,
        notification_url: `${window.location.origin}/api/payment-webhook` // για webhook
      };

      // TODO: Όταν έρθουν τα στοιχεία myPOS, θα προστεθεί εδώ η πραγματική κλήση API
      console.log('Payment parameters ready for myPOS:', paymentParams);
      
      // Προσωρινά επιστρέφουμε mock URL
      return this.createMockPaymentUrl(paymentParams);
      
    } catch (error) {
      console.error('Error creating payment URL:', error);
      throw new Error('Σφάλμα κατά τη δημιουργία πληρωμής');
    }
  }

  /**
   * Mock payment URL (προσωρινά για δοκιμές)
   */
  createMockPaymentUrl(params) {
    const mockParams = new URLSearchParams({
      order_id: params.order_id,
      amount: params.amount,
      description: params.description
    });
    return `/payment-mock?${mockParams.toString()}`;
  }

  /**
   * Ενημέρωση κατάστασης παραγγελίας μετά από πληρωμή
   * @param {String} orderId - ID παραγγελίας  
   * @param {Object} paymentData - Στοιχεία πληρωμής από myPOS
   */
  async updateOrderPaymentStatus(orderId, paymentData) {
    try {
      const updateData = {
        payment_status: paymentData.success ? 'paid' : 'failed',
        status: paymentData.success ? 'paid' : 'pending',
        payment_id: paymentData.payment_id || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error('Σφάλμα ενημέρωσης παραγγελίας: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Validation webhook από myPOS
   * @param {Object} webhookData - Δεδομένα από myPOS webhook
   */
  async validateWebhook(webhookData) {
    // TODO: Προσθήκη myPOS signature validation
    // Όταν έρθουν τα στοιχεία, θα προστεθεί signature checking
    
    return {
      isValid: true, // Προσωρινά true για δοκιμές
      orderId: webhookData.order_id,
      paymentId: webhookData.payment_id,
      success: webhookData.status === 'success'
    };
  }

  /**
   * Refund πληρωμής (για μελλοντική χρήση)
   * @param {String} paymentId - myPOS payment ID
   * @param {Number} amount - Ποσό refund
   */
  async refundPayment(paymentId, amount) {
    // TODO: myPOS refund API integration
    console.log(`Refund request: ${paymentId}, amount: ${amount}`);
    return { success: true, refund_id: 'mock_refund_' + Date.now() };
  }
}

export default new PaymentService();
