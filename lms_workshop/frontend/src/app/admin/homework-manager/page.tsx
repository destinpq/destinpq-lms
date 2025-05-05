'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './homework-manager.module.css';

interface Course {
  id: string;
  title: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: string;
  status: string;
  courseId: string;
  courseName?: string;
  assignedToId?: string;
  assignedToEmail?: string;
}

export default function HomeworkManager() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [filteredHomework, setFilteredHomework] = useState<Homework[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // New homework form
  const [showNewHomeworkForm, setShowNewHomeworkForm] = useState<boolean>(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: 'assignment',
    courseId: '',
    assignToAllStudents: true
  });
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editHomework, setEditHomework] = useState<Homework | null>(null);
  const [updateIndividualAssignments, setUpdateIndividualAssignments] = useState<boolean>(true);
  
  // Bulk actions
  const [selectedHomeworkIds, setSelectedHomeworkIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch courses and homework data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || loading) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch courses
        const coursesResponse = await fetch('http://localhost:4001/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
        
        // Fetch homework
        const homeworkResponse = await fetch('http://localhost:4001/homework', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!homeworkResponse.ok) {
          throw new Error('Failed to fetch homework');
        }
        
        const homeworkData = await homeworkResponse.json();
        
        // Process homework data to include course name
        const processedHomework = homeworkData.map((hw: any) => ({
          ...hw,
          dueDate: new Date(hw.dueDate).toISOString().split('T')[0],
          courseName: hw.course?.title || 'Unknown Course',
          assignedToEmail: hw.assignedTo?.email || null
        }));
        
        setHomework(processedHomework);
        setFilteredHomework(processedHomework);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, loading]);

  // Filter homework when selected course changes
  useEffect(() => {
    if (selectedCourse === 'all') {
      setFilteredHomework(homework);
    } else {
      setFilteredHomework(homework.filter(hw => hw.courseId === selectedCourse));
    }
  }, [selectedCourse, homework]);

  // Handle course selection change
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  // Handle new homework form input changes
  const handleNewHomeworkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewHomework(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setNewHomework(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Submit new homework
  const handleSubmitNewHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('http://localhost:4001/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newHomework)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create homework');
      }
      
      const result = await response.json();
      
      // Reset form and refresh data
      setNewHomework({
        title: '',
        description: '',
        dueDate: '',
        category: 'assignment',
        courseId: '',
        assignToAllStudents: true
      });
      setShowNewHomeworkForm(false);
      setSuccess('Homework created successfully!');
      
      // Refresh homework list
      const homeworkResponse = await fetch('http://localhost:4001/homework', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (homeworkResponse.ok) {
        const homeworkData = await homeworkResponse.json();
        const processedHomework = homeworkData.map((hw: any) => ({
          ...hw,
          dueDate: new Date(hw.dueDate).toISOString().split('T')[0],
          courseName: hw.course?.title || 'Unknown Course',
          assignedToEmail: hw.assignedTo?.email || null
        }));
        
        setHomework(processedHomework);
      }
    } catch (error) {
      console.error('Error creating homework:', error);
      setError('Failed to create homework. Please try again.');
    }
  };

  // Edit homework - open modal
  const handleEditHomework = (hw: Homework) => {
    // Only select master homework (those without assignedToId)
    if (!hw.assignedToId) {
      setEditHomework(hw);
      setShowEditModal(true);
    } else {
      setError('You can only edit master homework assignments, not individual student assignments.');
    }
  };

  // Handle edit form input changes
  const handleEditHomeworkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'updateIndividualAssignments') {
        setUpdateIndividualAssignments(checked);
      } else if (editHomework) {
        setEditHomework({
          ...editHomework,
          [name]: checked
        });
      }
    } else if (editHomework) {
      setEditHomework({
        ...editHomework,
        [name]: value
      });
    }
  };

  // Submit homework edit
  const handleSubmitEditHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHomework) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`http://localhost:4001/homework/master/${editHomework.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...editHomework,
          updateIndividualAssignments
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update homework');
      }
      
      const result = await response.json();
      
      // Close modal and refresh data
      setShowEditModal(false);
      setEditHomework(null);
      setSuccess('Homework updated successfully!');
      
      // Refresh homework list
      const homeworkResponse = await fetch('http://localhost:4001/homework', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (homeworkResponse.ok) {
        const homeworkData = await homeworkResponse.json();
        const processedHomework = homeworkData.map((hw: any) => ({
          ...hw,
          dueDate: new Date(hw.dueDate).toISOString().split('T')[0],
          courseName: hw.course?.title || 'Unknown Course',
          assignedToEmail: hw.assignedTo?.email || null
        }));
        
        setHomework(processedHomework);
      }
    } catch (error) {
      console.error('Error updating homework:', error);
      setError('Failed to update homework. Please try again.');
    }
  };

  // Delete homework
  const handleDeleteHomework = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework? This action cannot be undone.')) {
      return;
    }
    
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`http://localhost:4001/homework/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deleteIndividualAssignments: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete homework');
      }
      
      // Refresh homework list
      const updatedHomework = homework.filter(hw => hw.id !== id && hw.title.indexOf(`Individual ${homework.find(h => h.id === id)?.title}`) !== 0);
      setHomework(updatedHomework);
      setSuccess('Homework deleted successfully!');
    } catch (error) {
      console.error('Error deleting homework:', error);
      setError('Failed to delete homework. Please try again.');
    }
  };

  // Handle homework selection for bulk actions
  const handleSelectHomework = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedHomeworkIds(prev => [...prev, id]);
    } else {
      setSelectedHomeworkIds(prev => prev.filter(hwId => hwId !== id));
    }
  };

  // Handle bulk action selection
  const handleBulkActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBulkAction(e.target.value);
  };

  // Apply bulk action
  const applyBulkAction = async () => {
    if (!bulkAction || selectedHomeworkIds.length === 0) {
      setError('Please select an action and at least one homework assignment.');
      return;
    }
    
    setError(null);
    setSuccess(null);
    
    try {
      if (bulkAction === 'delete') {
        if (!confirm(`Are you sure you want to delete ${selectedHomeworkIds.length} selected homework assignments? This action cannot be undone.`)) {
          return;
        }
        
        // Delete each selected homework
        for (const id of selectedHomeworkIds) {
          await fetch(`http://localhost:4001/homework/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              deleteIndividualAssignments: true
            })
          });
        }
        
        // Refresh homework list
        const updatedHomework = homework.filter(hw => !selectedHomeworkIds.includes(hw.id));
        setHomework(updatedHomework);
      } else {
        // Update status
        const response = await fetch('http://localhost:4001/homework/bulk-status-update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            homeworkIds: selectedHomeworkIds,
            status: bulkAction
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update homework status');
        }
        
        // Update local state
        const updatedHomework = homework.map(hw => {
          if (selectedHomeworkIds.includes(hw.id)) {
            return { ...hw, status: bulkAction };
          }
          return hw;
        });
        
        setHomework(updatedHomework);
      }
      
      // Reset selections
      setSelectedHomeworkIds([]);
      setBulkAction('');
      setSuccess(`Bulk action applied successfully to ${selectedHomeworkIds.length} items!`);
    } catch (error) {
      console.error('Error applying bulk action:', error);
      setError('Failed to apply bulk action. Please try again.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className={styles.container}>
        <h1>Homework Manager</h1>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Homework Manager</h1>
      
      {/* Success and error messages */}
      {success && <div className={styles.successMessage}>{success}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterControls}>
          <label>
            Filter by Course:
            <select value={selectedCourse} onChange={handleCourseChange}>
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </label>
        </div>
        
        <button 
          className={styles.addButton}
          onClick={() => setShowNewHomeworkForm(!showNewHomeworkForm)}
        >
          {showNewHomeworkForm ? 'Cancel' : 'Add New Homework'}
        </button>
      </div>
      
      {/* New Homework Form */}
      {showNewHomeworkForm && (
        <div className={styles.formContainer}>
          <h2>Create New Homework</h2>
          <form onSubmit={handleSubmitNewHomework}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newHomework.title}
                onChange={handleNewHomeworkChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newHomework.description}
                onChange={handleNewHomeworkChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="dueDate">Due Date:</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newHomework.dueDate}
                onChange={handleNewHomeworkChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={newHomework.category}
                onChange={handleNewHomeworkChange}
              >
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
                <option value="quiz">Quiz</option>
                <option value="reflection">Reflection</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="courseId">Course:</label>
              <select
                id="courseId"
                name="courseId"
                value={newHomework.courseId}
                onChange={handleNewHomeworkChange}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="assignToAllStudents">
                <input
                  type="checkbox"
                  id="assignToAllStudents"
                  name="assignToAllStudents"
                  checked={newHomework.assignToAllStudents}
                  onChange={handleNewHomeworkChange}
                />
                Assign to all students in this course
              </label>
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>Create Homework</button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => setShowNewHomeworkForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Bulk Actions */}
      <div className={styles.bulkActions}>
        <h3>Bulk Actions ({selectedHomeworkIds.length} selected)</h3>
        <div className={styles.bulkActionControls}>
          <select value={bulkAction} onChange={handleBulkActionChange}>
            <option value="">Select Action</option>
            <option value="not_started">Set Status: Not Started</option>
            <option value="in_progress">Set Status: In Progress</option>
            <option value="completed">Set Status: Completed</option>
            <option value="graded">Set Status: Graded</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button 
            className={styles.applyButton}
            onClick={applyBulkAction}
            disabled={!bulkAction || selectedHomeworkIds.length === 0}
          >
            Apply to Selected
          </button>
        </div>
      </div>
      
      {/* Homework Table */}
      <div className={styles.tableContainer}>
        {filteredHomework.length === 0 ? (
          <p>No homework assignments found.</p>
        ) : (
          <table className={styles.homeworkTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        // Only select master homework (without assignedToId)
                        const masterHomeworkIds = filteredHomework
                          .filter(hw => !hw.assignedToId)
                          .map(hw => hw.id);
                        setSelectedHomeworkIds(masterHomeworkIds);
                      } else {
                        setSelectedHomeworkIds([]);
                      }
                    }}
                    checked={
                      selectedHomeworkIds.length > 0 && 
                      selectedHomeworkIds.length === filteredHomework.filter(hw => !hw.assignedToId).length
                    }
                  />
                </th>
                <th>Title</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Category</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHomework.map((hw) => (
                <tr 
                  key={hw.id} 
                  className={hw.assignedToId ? styles.individualAssignment : styles.masterAssignment}
                >
                  <td>
                    {!hw.assignedToId && (
                      <input
                        type="checkbox"
                        checked={selectedHomeworkIds.includes(hw.id)}
                        onChange={(e) => handleSelectHomework(hw.id, e.target.checked)}
                      />
                    )}
                  </td>
                  <td>{hw.title}</td>
                  <td>{hw.courseName}</td>
                  <td>{new Date(hw.dueDate).toLocaleDateString()}</td>
                  <td>{hw.category}</td>
                  <td>{hw.status}</td>
                  <td>{hw.assignedToEmail || 'All Students'}</td>
                  <td>
                    {!hw.assignedToId && (
                      <>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditHomework(hw)}
                        >
                          Edit
                        </button>
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleDeleteHomework(hw.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Edit Modal */}
      {showEditModal && editHomework && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Edit Homework</h2>
            <form onSubmit={handleSubmitEditHomework}>
              <div className={styles.formGroup}>
                <label htmlFor="editTitle">Title:</label>
                <input
                  type="text"
                  id="editTitle"
                  name="title"
                  value={editHomework.title}
                  onChange={handleEditHomeworkChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="editDescription">Description:</label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={editHomework.description}
                  onChange={handleEditHomeworkChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="editDueDate">Due Date:</label>
                <input
                  type="date"
                  id="editDueDate"
                  name="dueDate"
                  value={editHomework.dueDate}
                  onChange={handleEditHomeworkChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="editCategory">Category:</label>
                <select
                  id="editCategory"
                  name="category"
                  value={editHomework.category}
                  onChange={handleEditHomeworkChange}
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="quiz">Quiz</option>
                  <option value="reflection">Reflection</option>
                  <option value="exercise">Exercise</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="updateIndividualAssignments">
                  <input
                    type="checkbox"
                    id="updateIndividualAssignments"
                    name="updateIndividualAssignments"
                    checked={updateIndividualAssignments}
                    onChange={handleEditHomeworkChange}
                  />
                  Update individual student assignments with these changes
                </label>
              </div>
              
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>Update Homework</button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditHomework(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 