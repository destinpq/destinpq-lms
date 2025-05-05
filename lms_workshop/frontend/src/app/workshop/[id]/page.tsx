'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import styles from './workshop.module.css';
import { useAppRouter } from '@/components/AppLink';
import { getAssetPath } from '@/utils/assetHelper';

interface WorkshopData {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  content: string;
  materials?: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
}

export default function WorkshopPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useAppRouter();
  const [workshopData, setWorkshopData] = useState<WorkshopData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if tab parameter is present and set the active tab
    const tabParam = searchParams.get('tab');
    if (tabParam === 'materials') {
      setActiveTab('materials');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchWorkshopData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, fetch from backend API
        // For now, we'll create mock data based on the ID
        // Mock data - in a real app, this would come from your API
        if (id === 'adv-cognitive-techniques') {
          setWorkshopData({
            id: id as string,
            title: 'Advanced Cognitive Techniques',
            date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            instructor: 'Dr. Sarah Johnson',
            description: 'This workshop explores advanced cognitive techniques used in modern psychology, with a focus on practical applications in therapeutic settings.',
            content: '<h2>Workshop Overview</h2><p>In this interactive workshop, you will learn how to apply advanced cognitive techniques to help clients overcome challenging thought patterns and behaviors. Dr. Sarah Johnson will guide you through evidence-based approaches that have shown significant results in clinical practice.</p><h3>What to Expect</h3><ul><li>Hands-on exercises and role-playing</li><li>Case study analysis</li><li>Group discussions and collaborative problem-solving</li><li>Take-home resources and tools</li></ul>',
            materials: [
              {
                id: '1',
                title: 'Pre-Workshop Reading: Cognitive Restructuring Basics',
                url: getAssetPath('/materials/cognitive-restructuring.pdf'),
                type: 'PDF'
              },
              {
                id: '2',
                title: 'Workshop Slides',
                url: getAssetPath('/materials/adv-cognitive-slides.pptx'),
                type: 'Presentation'
              },
              {
                id: '3',
                title: 'Practice Exercises',
                url: getAssetPath('/materials/practice-exercises.pdf'),
                type: 'PDF'
              }
            ]
          });
        } else {
          throw new Error('Workshop not found');
        }
      } catch (error) {
        console.error('Error fetching workshop data:', error);
        setError('Failed to load workshop data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchWorkshopData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => router.push('/student/dashboard')} className={styles.button}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!workshopData) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3>Workshop Not Found</h3>
          <p>The requested workshop could not be found.</p>
          <button onClick={() => router.push('/student/dashboard')} className={styles.button}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className={styles.workshopContainer}>
      {/* Workshop Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{workshopData.title}</h1>
          <div className={styles.metadata}>
            <p className={styles.instructor}>Instructor: {workshopData.instructor}</p>
            <p className={styles.date}>Date: {formatDate(workshopData.date)}</p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'materials' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          Materials
        </button>
      </div>
      
      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div dangerouslySetInnerHTML={{ __html: workshopData.content }} />
            
            <div className={styles.joinSection}>
              <h3>Ready to participate?</h3>
              <p>The workshop will be available at the scheduled time.</p>
              <button className={styles.joinButton}>
                Join Workshop
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'materials' && (
          <div className={styles.materials}>
            <h2>Preparatory Materials</h2>
            <p>Please review these materials before the workshop begins:</p>
            
            <div className={styles.materialsList}>
              {workshopData.materials?.map((material) => (
                <div key={material.id} className={styles.materialItem}>
                  <div className={styles.materialIcon}>
                    {material.type === 'PDF' && '📄'}
                    {material.type === 'Presentation' && '📊'}
                    {material.type === 'Video' && '🎬'}
                    {!['PDF', 'Presentation', 'Video'].includes(material.type) && '📁'}
                  </div>
                  <div className={styles.materialInfo}>
                    <h3>{material.title}</h3>
                    <p>{material.type}</p>
                  </div>
                  <a href={material.url} className={styles.downloadButton}>
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 