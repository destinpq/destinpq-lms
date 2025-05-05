'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import styles from './new-course.module.css';

export default function NewCourse() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    totalWeeks: 0,
    coverImage: '',
  });
  
  // Module state (for adding modules to the course)
  const [modules, setModules] = useState([
    { title: '', order: 1, lessons: [] }
  ]);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }
  
  if (!user || !user.isAdmin) {
    return null; // Will redirect via useEffect
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleModuleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedModules = [...modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [name]: value
    };
    setModules(updatedModules);
  };
  
  const addModule = () => {
    setModules((prev) => [
      ...prev,
      { title: '', order: prev.length + 1, lessons: [] }
    ]);
  };
  
  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = modules.filter((_, i) => i !== index);
      // Update order numbers
      updatedModules.forEach((module, i) => {
        module.order = i + 1;
      });
      setModules(updatedModules);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Implementation will connect to the backend API
      // For now, just redirect back to the dashboard
      alert('Course creation functionality will be implemented with backend integration');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error creating course:', error);
      setErrors({ submit: 'Failed to create course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.newCourseContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Create New Course</h1>
          <div className={styles.headerActions}>
            <Link href="/admin/dashboard" className={styles.secondaryButton}>
              Cancel
            </Link>
          </div>
        </div>
      </header>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.courseForm}>
          <div className={styles.formSection}>
            <h2 className={styles.formSectionTitle}>Course Details</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">Course Title <span className={styles.required}>*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description <span className={styles.required}>*</span></label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.formTextarea}
                rows={4}
                required
              ></textarea>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="instructor">Instructor <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  id="instructor"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="totalWeeks">Duration (weeks)</label>
                <input
                  type="number"
                  id="totalWeeks"
                  name="totalWeeks"
                  value={formData.totalWeeks}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  min="0"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="coverImage">Cover Image URL</label>
              <input
                type="text"
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.formSectionTitle}>Course Modules</h2>
              <button 
                type="button" 
                className={styles.addButton}
                onClick={addModule}
              >
                Add Module
              </button>
            </div>
            
            {modules.map((module, index) => (
              <div key={index} className={styles.moduleCard}>
                <div className={styles.moduleHeader}>
                  <h3 className={styles.moduleTitle}>Module {module.order}</h3>
                  {modules.length > 1 && (
                    <button 
                      type="button" 
                      className={styles.removeButton}
                      onClick={() => removeModule(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor={`module-${index}-title`}>Module Title <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    id={`module-${index}-title`}
                    name="title"
                    value={module.title}
                    onChange={(e) => handleModuleChange(index, e)}
                    className={styles.formInput}
                    required
                  />
                </div>
                
                <div className={styles.lessonNote}>
                  <p>You will be able to add lessons after creating the course.</p>
                </div>
              </div>
            ))}
          </div>
          
          {errors.submit && (
            <div className={styles.errorMessage}>
              {errors.submit}
            </div>
          )}
          
          <div className={styles.formActions}>
            <Link href="/admin/dashboard" className={styles.cancelButton}>
              Cancel
            </Link>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 