'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import styles from '../../admin.module.css';

export default function NewWorkshop() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    scheduledAt: '',
    preparatoryMaterials: '',
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:4001/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create workshop');
      }

      router.push('/admin/dashboard?tab=workshops');
    } catch (error) {
      console.error('Failed to create workshop:', error);
      setErrorMessage(error.message || 'Failed to create workshop');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    router.push('/login');
    return null;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Create New Workshop</h1>
        <Link href="/admin/dashboard?tab=workshops" className={styles.backLink}>
          Back to Workshops
        </Link>
      </div>

      <div className={styles.formContainer}>
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Workshop Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.textInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textArea}
              rows={5}
              required
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="instructor">Instructor Name *</label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className={styles.textInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="scheduledAt">Workshop Date & Time *</label>
            <input
              type="datetime-local"
              id="scheduledAt"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              className={styles.textInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="preparatoryMaterials">Preparatory Materials</label>
            <textarea
              id="preparatoryMaterials"
              name="preparatoryMaterials"
              value={formData.preparatoryMaterials}
              onChange={handleChange}
              className={styles.textArea}
              rows={4}
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.selectInput}
            >
              <option value="">Select a category</option>
              <option value="Cognitive Behavioral Therapy">Cognitive Behavioral Therapy</option>
              <option value="Mental Health Fundamentals">Mental Health Fundamentals</option>
              <option value="Clinical Psychology">Clinical Psychology</option>
              <option value="Mindfulness">Mindfulness</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard?tab=workshops')}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 