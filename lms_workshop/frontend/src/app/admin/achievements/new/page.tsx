'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import styles from '../../admin.module.css';

export default function NewAchievement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'badge',
    imageUrl: '',
    criteria: '',
    courseId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const submitData = {
        ...formData,
        courseId: formData.courseId ? parseInt(formData.courseId, 10) : null,
      };

      const response = await fetch('http://localhost:4001/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create achievement');
      }

      router.push('/admin/dashboard?tab=achievements');
    } catch (error: unknown) {
      console.error('Failed to create achievement:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create achievement';
      setErrorMessage(errorMsg);
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
        <h1>Create New Achievement</h1>
        <Link href="/admin/dashboard?tab=achievements" className={styles.backLink}>
          Back to Achievements
        </Link>
      </div>

      <div className={styles.formContainer}>
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Achievement Title *</label>
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
              rows={3}
              required
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Achievement Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={styles.selectInput}
              required
            >
              <option value="badge">Badge</option>
              <option value="certificate">Certificate</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={styles.textInput}
              placeholder="https://example.com/badge-image.png"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="criteria">Achievement Criteria</label>
            <textarea
              id="criteria"
              name="criteria"
              value={formData.criteria}
              onChange={handleChange}
              className={styles.textArea}
              rows={3}
              placeholder="Describe what a student needs to do to earn this achievement"
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="courseId">Related Course (Optional)</label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className={styles.textInput}
              placeholder="Enter course ID if this achievement is related to a specific course"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard?tab=achievements')}
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
              {isSubmitting ? 'Creating...' : 'Create Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 