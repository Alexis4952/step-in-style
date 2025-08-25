import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaReply, FaArchive, FaTrash, FaEye, FaFilter, FaSearch } from 'react-icons/fa';
import './App.css';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read, replied, archived
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch messages from API
  const fetchMessages = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;
      const params = new URLSearchParams({
        limit: 20,
        offset: (currentPage - 1) * 20
      });
      
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`http://localhost:5000/api/contact?${params}`);
      const data = await response.json();

      if (data.success) {
        if (resetPage) {
          setMessages(data.messages);
          setPage(1);
        } else {
          setMessages(prev => [...prev, ...data.messages]);
        }
        setHasMore(data.hasMore);
      } else {
        setError(data.error || 'Σφάλμα κατά τη φόρτωση μηνυμάτων');
      }
    } catch (err) {
      console.error('Σφάλμα:', err);
      setError('Παρουσιάστηκε σφάλμα κατά τη φόρτωση');
    } finally {
      setLoading(false);
    }
  };

  // Update message status
  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contact/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        ));
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert('Σφάλμα: ' + data.error);
      }
    } catch (err) {
      console.error('Σφάλμα κατά την ενημέρωση:', err);
      alert('Παρουσιάστηκε σφάλμα');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το μήνυμα;')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/contact/${messageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        alert('Σφάλμα: ' + data.error);
      }
    } catch (err) {
      console.error('Σφάλμα κατά τη διαγραφή:', err);
      alert('Παρουσιάστηκε σφάλμα');
    }
  };

  // Filter messages by search term
  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge style
  const getStatusBadge = (status) => {
    const styles = {
      unread: { bg: '#ff4757', text: 'Μη αναγνωσμένο' },
      read: { bg: '#5352ed', text: 'Αναγνωσμένο' },
      replied: { bg: '#2ed573', text: 'Απαντήθηκε' },
      archived: { bg: '#747d8c', text: 'Αρχειοθετημένο' }
    };
    const style = styles[status] || styles.unread;
    return (
      <span style={{
        background: style.bg,
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchMessages(true);
  }, [filter]);

  return (
    <div className="admin-messages-container" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="messages-header" style={{ 
        background: 'linear-gradient(135deg, #b87b2a 0%, #d4941f 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <FaEnvelope size={28} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Μηνύματα Επικοινωνίας</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Διαχείριση μηνυμάτων από πελάτες</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="messages-controls" style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5d6c7',
        marginBottom: '20px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaFilter style={{ color: '#b87b2a' }} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5d6c7',
              borderRadius: '6px',
              fontFamily: 'Montserrat'
            }}
          >
            <option value="all">Όλα τα μηνύματα</option>
            <option value="unread">Μη αναγνωσμένα</option>
            <option value="read">Αναγνωσμένα</option>
            <option value="replied">Απαντημένα</option>
            <option value="archived">Αρχειοθετημένα</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <FaSearch style={{ color: '#b87b2a' }} />
          <input
            type="text"
            placeholder="Αναζήτηση σε όνομα, email, θέμα ή μήνυμα..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #e5d6c7',
              borderRadius: '6px',
              fontFamily: 'Montserrat'
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          background: '#ff4757',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div className="messages-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Messages List */}
        <div className="messages-list" style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5d6c7',
          maxHeight: '70vh',
          overflow: 'auto'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #e5d6c7',
            background: '#f8f6f3',
            fontWeight: '600',
            color: '#b87b2a'
          }}>
            Λίστα Μηνυμάτων ({filteredMessages.length})
          </div>

          {loading && messages.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Φόρτωση μηνυμάτων...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Δεν βρέθηκαν μηνύματα
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  if (message.status === 'unread') {
                    updateMessageStatus(message.id, 'read');
                  }
                }}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  background: selectedMessage?.id === message.id ? '#fff6ec' : 
                             message.status === 'unread' ? '#fff' : '#fafafa',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#fff6ec'}
                onMouseLeave={(e) => {
                  e.target.style.background = selectedMessage?.id === message.id ? '#fff6ec' : 
                                             message.status === 'unread' ? '#fff' : '#fafafa';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '600', color: '#2c2c2c' }}>
                    {message.status === 'unread' && <FaEnvelope style={{ marginRight: '8px', color: '#ff4757' }} />}
                    {message.name}
                  </div>
                  {getStatusBadge(message.status)}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>
                  {message.email}
                </div>
                <div style={{ color: '#b87b2a', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
                  {message.subject || 'Χωρίς θέμα'}
                </div>
                <div style={{ color: '#888', fontSize: '0.8rem' }}>
                  {formatDate(message.created_at)}
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setPage(prev => prev + 1);
                  fetchMessages();
                }}
                style={{
                  background: '#b87b2a',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat',
                  fontWeight: '600'
                }}
              >
                Φόρτωση περισσότερων
              </button>
            </div>
          )}
        </div>

        {/* Message Details */}
        <div className="message-details" style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5d6c7',
          maxHeight: '70vh',
          overflow: 'auto'
        }}>
          {selectedMessage ? (
            <>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5d6c7',
                background: '#f8f6f3'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#2c2c2c' }}>
                    {selectedMessage.subject || 'Χωρίς θέμα'}
                  </h3>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <strong>Όνομα:</strong> {selectedMessage.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedMessage.email}
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <strong>Τηλέφωνο:</strong> {selectedMessage.phone}
                    </div>
                  )}
                  <div>
                    <strong>Ημερομηνία:</strong> {formatDate(selectedMessage.created_at)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                    disabled={selectedMessage.status === 'replied'}
                    style={{
                      background: selectedMessage.status === 'replied' ? '#ccc' : '#2ed573',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: selectedMessage.status === 'replied' ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <FaReply /> Σημείωση ως απαντημένο
                  </button>
                  
                  <button
                    onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                    disabled={selectedMessage.status === 'archived'}
                    style={{
                      background: selectedMessage.status === 'archived' ? '#ccc' : '#747d8c',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: selectedMessage.status === 'archived' ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <FaArchive /> Αρχειοθέτηση
                  </button>

                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    style={{
                      background: '#ff4757',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <FaTrash /> Διαγραφή
                  </button>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#b87b2a' }}>Μήνυμα:</h4>
                <div style={{
                  background: '#f8f6f3',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5d6c7',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedMessage.message}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#666',
              textAlign: 'center',
              padding: '40px'
            }}>
              <FaEye size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
              <h3>Επιλέξτε ένα μήνυμα</h3>
              <p>Κάντε κλικ σε ένα μήνυμα από τη λίστα για να δείτε τις λεπτομέρειες</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
