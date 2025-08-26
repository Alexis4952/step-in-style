import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Real-time subscription για νέες order notifications από Supabase
    const subscription = supabase
      .channel('admin_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'admin_notifications' 
        }, 
        (payload) => {
          console.log('New admin notification:', payload);
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Browser notification (αν επιτρέπεται)
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    // Polling για contact notifications από το δικό μας API κάθε 10 δευτερόλεπτα
    const contactInterval = setInterval(fetchContactNotifications, 10000);

    return () => {
      subscription.unsubscribe();
      clearInterval(contactInterval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      // 1. Φόρτωση παραγγελιών από Supabase (παλιό σύστημα)
      const { data: supabaseNotifications, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching Supabase notifications:', error);
      }

      // 2. Φόρτωση contact notifications από δικό μας API  
      const contactResponse = await fetch('https://step-in-style-backend.onrender.com/api/contact/notifications');
      const contactData = await contactResponse.json();
      
      let contactNotifications = [];
      if (contactData.success) {
        contactNotifications = contactData.notifications;
      }

      // 3. Συνδυασμός όλων των notifications
      const allNotifications = [
        ...(supabaseNotifications || []),
        ...contactNotifications
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications(allNotifications);
      const unread = allNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactNotifications = async () => {
    try {
      // Μόνο για contact notifications (για το polling)
      const response = await fetch('https://step-in-style-backend.onrender.com/api/contact/notifications');
      const data = await response.json();

      if (data.success) {
        // Ενημέρωση μόνο των contact notifications
        setNotifications(prev => {
          const nonContactNotifications = prev.filter(n => n.type !== 'new_contact_message');
          const existingContactNotifications = prev.filter(n => n.type === 'new_contact_message');
          
          // Merge existing read status with new data
          const updatedContactNotifications = data.notifications.map(newNotification => {
            const existing = existingContactNotifications.find(existing => existing.id === newNotification.id);
            return existing ? { ...newNotification, read: existing.read } : newNotification;
          });
          
          const allNotifications = [
            ...nonContactNotifications,
            ...updatedContactNotifications
          ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          return allNotifications;
        });
        
        // Ενημέρωση unread count με βάση τα πραγματικά unread (μετά το merge)
        setTimeout(() => {
          setNotifications(current => {
            const contactUnread = current.filter(n => n.type === 'new_contact_message' && !n.read).length;
            const otherUnread = current.filter(n => n.type !== 'new_contact_message' && !n.read).length;
            setUnreadCount(contactUnread + otherUnread);
            return current;
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching contact notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification?.type === 'new_contact_message' || notification?.type === 'new_order') {
        // Contact notification ή guest order notification - χρησιμοποιούμε το δικό μας API
        const endpoint = notification?.type === 'new_contact_message' 
          ? `https://step-in-style-backend.onrender.com/api/contact/notifications/${notificationId}/read`
          : `https://step-in-style-backend.onrender.com/api/contact/notifications/${notificationId}/read`; // Reuse same endpoint for simplicity
        
        const response = await fetch(endpoint, {
          method: 'PUT'
        });
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Legacy Supabase order notification - χρησιμοποιούμε Supabase
        const { error } = await supabase
          .from('admin_notifications')
          .update({ read: true })
          .eq('id', notificationId);

        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }

        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all Supabase notifications as read
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('Error marking Supabase notifications as read:', error);
      }

      // Mark all notifications as read in UI (includes contact notifications)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'new_order' && notification.order_id) {
      setShowDropdown(false);
      navigate('/admin/orders');
    } else if (notification.type === 'new_contact_message') {
      setShowDropdown(false);
      navigate('/admin/messages');
    }
  };

  const formatTime = (timestamp) => {
    // Προσαρμογή για Supabase UTC timestamps
    const date = new Date(timestamp);
    const now = new Date();
    
    // Υπολογισμός σωστής διαφοράς χρόνου
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    console.log('⏰ Time debug:', {
      timestamp,
      date: date.toLocaleString('el-GR'),
      now: now.toLocaleString('el-GR'),
      diffSeconds,
      diffMins,
      diffHours
    });

    // Εμφάνιση με βάση την πραγματική διαφορά
    if (diffSeconds < 30) return 'Μόλις τώρα';
    if (diffMins < 1) return 'Πριν από λίγα δευτερόλεπτα';
    if (diffMins < 60) return `${diffMins} λεπτό${diffMins > 1 ? 'α' : ''} πριν`;
    if (diffHours < 24) return `${diffHours} ώρ${diffHours > 1 ? 'ες' : 'α'} πριν`;
    if (diffDays < 7) return `${diffDays} μέρ${diffDays > 1 ? 'ες' : 'α'} πριν`;
    
    // Για παλιές notifications, πλήρης ημερομηνία
    return date.toLocaleString('el-GR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-notifications">
      <button 
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Ειδοποιήσεις</h4>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Όλα ως διαβασμένα
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-item">Φόρτωση...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-item">Δεν υπάρχουν ειδοποιήσεις</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.type === 'new_contact_message' && '💬 '}
                      {notification.type === 'new_order' && '📦 '}
                      {notification.title}
                    </div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatTime(notification.created_at)}
                    </div>
                  </div>
                  {notification.type === 'new_order' && (
                    <div className="notification-amount">
                      {notification.amount}€
                    </div>
                  )}
                  {notification.type === 'new_contact_message' && (
                    <div className="notification-icon">
                      📧
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
