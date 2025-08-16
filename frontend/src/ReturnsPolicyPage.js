import React, { useEffect } from 'react';
import './ReturnsPolicyPage.css';
import { FaUndoAlt, FaShippingFast, FaClock, FaCheckCircle, FaTimesCircle, FaExchangeAlt, FaMoneyBillWave, FaBoxOpen } from 'react-icons/fa';

export default function ReturnsPolicyPage() {
  // Άμεσο scroll στην κορυφή όταν φορτώνει η σελίδα
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="returns-policy-page">
      {/* Hero Section */}
      <div className="returns-hero">
        <div className="returns-hero-content">
          <FaUndoAlt className="returns-hero-icon" />
          <h1>Πολιτική Επιστροφών</h1>
          <p>Όλα όσα πρέπει να γνωρίζετε για τις επιστροφές και αλλαγές στο Step in Style</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="returns-content">
        <div className="returns-container">
          
          {/* Overview Section */}
          <div className="returns-overview">
            <h2>📋 Γενικές Πληροφορίες</h2>
            <p className="overview-text">
              Στο Step in Style θέλουμε να είστε απόλυτα ευχαριστημένοι με την αγορά σας. 
              Για αυτό τον λόγο προσφέρουμε εύκολες και γρήγορες επιστροφές για όλα τα παπούτσια και αξεσουάρ μας.
            </p>
            
            <div className="policy-highlights">
              <div className="highlight-item">
                <FaClock className="highlight-icon" />
                <h3>14 ημέρες</h3>
                <p>Χρόνος επιστροφής</p>
              </div>
              <div className="highlight-item">
                <FaShippingFast className="highlight-icon" />
                <h3>Δωρεάν επιστροφή</h3>
                <p>Για ελαττωματικά προϊόντα</p>
              </div>
              <div className="highlight-item">
                <FaMoneyBillWave className="highlight-icon" />
                <h3>Πλήρης επιστροφή</h3>
                <p>Χρημάτων εντός 14 ημερών</p>
              </div>
            </div>
          </div>

          {/* Return Conditions */}
          <div className="returns-section">
            <div className="returns-section-header">
              <FaCheckCircle className="returns-icon" />
              <h2>1. Προϋποθέσεις Επιστροφής</h2>
            </div>
            <div className="returns-text">
              <h3>✅ Αποδεκτές Επιστροφές</h3>
              <ul className="conditions-list accepted">
                <li>Προϊόντα σε άριστη κατάσταση χωρίς φθορές</li>
                <li>Παπούτσια που δεν έχουν φορεθεί εκτός από δοκιμή στο σπίτι</li>
                <li>Διατήρηση αρχικής συσκευασίας και ετικετών</li>
                <li>Παρουσίαση αποδεικτικού αγοράς</li>
                <li>Επιστροφή εντός 14 ημερών από την παραλαβή</li>
                <li>Προϊόντα που δεν είναι εξατομικευμένα</li>
              </ul>
              
              <h3>❌ Μη Αποδεκτές Επιστροφές</h3>
              <ul className="conditions-list rejected">
                <li>Προϊόντα που έχουν φορεθεί εκτός σπιτιού</li>
                <li>Παπούτσια με φθορές στη σόλα ή το υλικό</li>
                <li>Προϊόντα χωρίς αρχική συσκευασία</li>
                <li>Εξατομικευμένα ή custom προϊόντα</li>
                <li>Προϊόντα υγιεινής (πατάκια, κάλτσες)</li>
                <li>Προϊόντα που έχουν παραποιηθεί ή καταστραφεί</li>
              </ul>
            </div>
          </div>

          {/* Return Process */}
          <div className="returns-section">
            <div className="returns-section-header">
              <FaBoxOpen className="returns-icon" />
              <h2>2. Διαδικασία Επιστροφής</h2>
            </div>
            <div className="returns-text">
              <div className="process-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Επικοινωνία</h4>
                    <p>Επικοινωνήστε μαζί μας εντός 14 ημερών μέσω email (returns@stepinstyle.gr) ή τηλεφώνου (210 1234567)</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Αίτηση Επιστροφής</h4>
                    <p>Συμπληρώστε την αίτηση επιστροφής με τα στοιχεία της παραγγελίας και τον λόγο επιστροφής</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Έγκριση & Οδηγίες</h4>
                    <p>Θα λάβετε email με έγκριση και οδηγίες για την αποστολή των προϊόντων</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Αποστολή Προϊόντων</h4>
                    <p>Πακετάρετε τα προϊόντα στην αρχική συσκευασία και αποστείλετε στη διεύθυνσή μας</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h4>Επιστροφή Χρημάτων</h4>
                    <p>Μετά τον έλεγχο, η επιστροφή χρημάτων γίνεται εντός 14 ημερών</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Policy */}
          <div className="returns-section">
            <div className="returns-section-header">
              <FaExchangeAlt className="returns-icon" />
              <h2>3. Αλλαγές Προϊόντων</h2>
            </div>
            <div className="returns-text">
              <h3>Αλλαγή Μεγέθους</h3>
              <p>Εάν το μέγεθος δεν σας ταιριάζει, μπορείτε να το αλλάξετε δωρεάν εντός 14 ημερών. Το νέο προϊόν θα αποσταλεί μόλις παραλάβουμε το αρχικό.</p>
              
              <h3>Αλλαγή Χρώματος/Μοντέλου</h3>
              <p>Μπορείτε να αλλάξετε το χρώμα ή το μοντέλο εφόσον το νέο προϊόν έχει την ίδια ή μεγαλύτερη αξία. Η διαφορά τιμής θα χρεωθεί επιπλέον.</p>
              
              <h3>Κόστος Αλλαγής</h3>
              <ul>
                <li><strong>Αλλαγή μεγέθους:</strong> Δωρεάν</li>
                <li><strong>Αλλαγή χρώματος/μοντέλου:</strong> Κόστος αποστολής 3,90€</li>
                <li><strong>Ελαττωματικό προϊόν:</strong> Δωρεάν αλλαγή και αποστολή</li>
              </ul>
            </div>
          </div>

          {/* Return Costs */}
          <div className="returns-section">
            <div className="returns-section-header">
              <FaShippingFast className="returns-icon" />
              <h2>4. Κόστος Επιστροφής</h2>
            </div>
            <div className="returns-text">
              <div className="cost-table">
                <div className="cost-item">
                  <h4>🎯 Δωρεάν Επιστροφή</h4>
                  <ul>
                    <li>Ελαττωματικά προϊόντα</li>
                    <li>Λάθος αποστολή προϊόντος</li>
                    <li>Προϊόντα που δεν αντιστοιχούν στην περιγραφή</li>
                  </ul>
                </div>
                
                <div className="cost-item">
                  <h4>💰 Επιστροφή με Κόστος (4,90€)</h4>
                  <ul>
                    <li>Αλλαγή γνώμης πελάτη</li>
                    <li>Λάθος επιλογή μεγέθους</li>
                    <li>Δεν ταιριάζει στο στυλ</li>
                  </ul>
                </div>
              </div>
              
              <div className="shipping-info">
                <h3>📦 Διεύθυνση Επιστροφής</h3>
                <div className="address-box">
                  <strong>Step in Style - Επιστροφές</strong><br/>
                  Ερμού 123<br/>
                  Αθήνα 10563<br/>
                  Τ.Κ. 10563<br/>
                  <em>Σημείωση: "Επιστροφή Παραγγελίας #[ΑΡΙΘΜΟΣ]"</em>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Process */}
          <div className="returns-section">
            <div className="returns-section-header">
              <FaMoneyBillWave className="returns-icon" />
              <h2>5. Επιστροφή Χρημάτων</h2>
            </div>
            <div className="returns-text">
              <h3>Χρόνος Επιστροφής</h3>
              <p>Η επιστροφή των χρημάτων γίνεται εντός <strong>14 εργάσιμων ημερών</strong> από την παραλαβή και έγκριση των προϊόντων.</p>
              
              <h3>Τρόπος Επιστροφής</h3>
              <ul>
                <li><strong>Πιστωτική/Χρεωστική Κάρτα:</strong> Επιστροφή στην ίδια κάρτα (5-10 εργάσιμες ημέρες)</li>
                <li><strong>PayPal:</strong> Επιστροφή στον PayPal λογαριασμό (3-5 εργάσιμες ημέρες)</li>
                <li><strong>Αντικαταβολή:</strong> Τραπεζικό έμβασμα στον λογαριασμό σας</li>
              </ul>
              
              <h3>Τι Επιστρέφεται</h3>
              <ul>
                <li>✅ Αξία προϊόντος</li>
                <li>✅ Αρχικό κόστος αποστολής (εάν η επιστροφή είναι δική μας ευθύνη)</li>
                <li>❌ Κόστος επιστροφής (εκτός αν είναι δική μας ευθύνη)</li>
              </ul>
            </div>
          </div>

          {/* Special Cases */}
          <div className="returns-section">
            <div className="returns-section-header">
              <FaTimesCircle className="returns-icon" />
              <h2>6. Ειδικές Περιπτώσεις</h2>
            </div>
            <div className="returns-text">
              <h3>Ελαττωματικά Προϊόντα</h3>
              <p>Εάν παραλάβετε ελαττωματικό προϊόν, επικοινωνήστε άμεσα μαζί μας. Η επιστροφή ή αλλαγή γίνεται δωρεάν με ταχυδρομικά έξοδα που βαρύνουν εμάς.</p>
              
              <h3>Λάθος Παραγγελία</h3>
              <p>Εάν λάβετε λάθος προϊόν, είμαστε υπεύθυνοι για την επιστροφή και αποστολή του σωστού προϊόντος χωρίς κόστος.</p>
              
              <h3>Καθυστερημένες Επιστροφές</h3>
              <p>Επιστροφές που γίνονται μετά τις 14 ημέρες εξετάζονται κατά περίπτωση και ενδέχεται να απορριφθούν.</p>
              
              <h3>Μεγάλες Παραγγελίες (άνω των 10 ζευγαριών)</h3>
              <p>Για μεγάλες παραγγελίες ισχύουν ειδικοί όροι. Επικοινωνήστε μαζί μας για περισσότερες πληροφορίες.</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="returns-contact">
            <h3>📞 Χρειάζεστε Βοήθεια;</h3>
            <p>Η ομάδα εξυπηρέτησης πελατών μας είναι εδώ για να σας βοηθήσει με οποιαδήποτε ερώτηση σχετικά με επιστροφές:</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <h4>📧 Email</h4>
                <p><strong>returns@stepinstyle.gr</strong></p>
                <small>Απάντηση εντός 24 ωρών</small>
              </div>
              
              <div className="contact-method">
                <h4>📞 Τηλέφωνο</h4>
                <p><strong>210 1234567</strong></p>
                <small>Δευτέρα - Παρασκευή: 9:00 - 18:00</small>
              </div>
              
              <div className="contact-method">
                <h4>💬 Live Chat</h4>
                <p><strong>stepinstyle.gr</strong></p>
                <small>Δευτέρα - Παρασκευή: 10:00 - 17:00</small>
              </div>
            </div>
            
            <p className="last-updated"><em>Τελευταία ενημέρωση: {new Date().toLocaleDateString('el-GR')}</em></p>
          </div>

        </div>
      </div>
    </div>
  );
}
