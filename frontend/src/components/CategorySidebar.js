import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './desktop/CategorySidebar.css';

export default function CategorySidebar({ onCategorySelect, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, display_order')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Σφάλμα κατά τη φόρτωση κατηγοριών:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  if (loading) {
    return (
      <div className="category-sidebar">
        <div className="sidebar-header">
          <h3>📂 Κατηγορίες</h3>
        </div>
        <div className="loading-categories">
          <div className="loading-spinner"></div>
          <p>Φόρτωση κατηγοριών...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-sidebar">
        <div className="sidebar-header">
          <h3>📂 Κατηγορίες</h3>
        </div>
        <div className="error-message">
          <p>Σφάλμα: {error}</p>
          <button onClick={fetchCategories} className="retry-btn">
            Δοκιμάστε ξανά
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-sidebar">
      <div className="sidebar-header">
        <h3>📂 Κατηγορίες</h3>
        <span className="category-count">({categories.length})</span>
      </div>
      
      <div className="categories-list">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-item ${selectedCategory?.id === category.id ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="category-content">
              <span className="category-name">{category.name}</span>
              {category.description && (
                <span className="category-description">{category.description}</span>
              )}
            </div>
            <div className="category-arrow">→</div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="no-categories">
          <p>Δεν βρέθηκαν κατηγορίες</p>
        </div>
      )}
    </div>
  );
} 