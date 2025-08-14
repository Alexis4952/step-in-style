import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import notificationService from '../../services/notificationService';

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Real-time subscription για νέες notifications
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
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
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'new_order' && notification.order_id) {
      setShowDropdown(false);
      navigate('/admin/orders');
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
                    <div className="notification-title">{notification.title}</div>
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
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
