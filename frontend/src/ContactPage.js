import React, { useState, useEffect } from 'react';
import './ContactPage.css';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaInstagram } from 'react-icons/fa';

export default function ContactPage() {
  // Άμεσο scroll στην κορυφή όταν φορτώνει η σελίδα
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Επικοινωνήστε μαζί μας</h1>
          <p>Είμαστε εδώ για να σας εξυπηρετήσουμε! Στείλτε μας το μήνυμά σας και θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="contact-content">
        <div className="contact-container">
          
          {/* Contact Info Section */}
          <div className="contact-info">
            <h2>Τα στοιχεία μας</h2>
            
            <div className="contact-info-card">
              <div className="contact-info-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div className="contact-details">
                  <h3>Διεύθυνση</h3>
                  <p>Ερμού 123, Αθήνα 10563<br/>Κέντρο, Ελλάδα</p>
                </div>
              </div>

              <div className="contact-info-item">
                <FaPhone className="contact-icon" />
                <div className="contact-details">
                  <h3>Τηλέφωνο</h3>
                  <p>210 1234567<br/>6944 123456</p>
                </div>
              </div>

              <div className="contact-info-item">
                <FaEnvelope className="contact-icon" />
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>info@stepinstyle.gr<br/>orders@stepinstyle.gr</p>
                </div>
              </div>

              <div className="contact-info-item">
                <FaClock className="contact-icon" />
                <div className="contact-details">
                  <h3>Ώρες Λειτουργίας</h3>
                  <p>Δευτέρα - Παρασκευή: 9:00 - 20:00<br/>
                     Σάββατο: 9:00 - 18:00<br/>
                     Κυριακή: 11:00 - 16:00</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="contact-social">
              <h3>Ακολουθήστε μας</h3>
              <div className="social-links">
                <a href="#" className="social-link facebook">
                  <FaFacebook />
                  <span>Facebook</span>
                </a>
                <a href="#" className="social-link instagram">
                  <FaInstagram />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="contact-form-section">
            <h2>Στείλτε μας μήνυμα</h2>
            
            {submitted && (
              <div className="form-success">
                <h3>🎉 Επιτυχής αποστολή!</h3>
                <p>Το μήνυμά σας στάλθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών.</p>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Ονοματεπώνυμο *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Το όνομά σας"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Τηλέφωνο</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="6944 123456"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Θέμα *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Επιλέξτε θέμα</option>
                    <option value="general">Γενική ερώτηση</option>
                    <option value="order">Πληροφορίες παραγγελίας</option>
                    <option value="return">Επιστροφή προϊόντος</option>
                    <option value="size">Οδηγός μεγεθών</option>
                    <option value="complaint">Παράπονο</option>
                    <option value="compliment">Συγχαρητήρια</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Μήνυμα *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Γράψτε το μήνυμά σας εδώ..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Αποστολή...' : 'Αποστολή Μηνύματος'}
              </button>
            </form>
          </div>
        </div>
      </div>


    </div>
  );
}
