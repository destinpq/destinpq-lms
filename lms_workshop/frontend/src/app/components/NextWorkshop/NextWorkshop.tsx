import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockCircleOutlined } from '@ant-design/icons';
import styles from './nextWorkshop.module.css';

interface Workshop {
  id: string;
  title: string;
  instructor: string;
  date: Date;
  link: string;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface NextWorkshopProps {
  workshop: Workshop;
}

export default function NextWorkshop({ workshop }: NextWorkshopProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = workshop.date.getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [workshop.date]);

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={styles.workshopCard}>
      <h2 className={styles.workshopTitle}>
        <ClockCircleOutlined style={{ marginRight: '8px' }} />
        {workshop.title}
      </h2>
      
      <p className={styles.workshopInfo}>
        <span className={styles.workshopInstructor}>Instructor: {workshop.instructor}</span><br />
        {formatDate(workshop.date)}
      </p>
      
      <div className={styles.countdownContainer}>
        <div className={styles.countdownItem}>
          <div className={styles.countdownValue}>{timeLeft.days}</div>
          <div className={styles.countdownLabel}>Days</div>
        </div>
        <div className={styles.countdownItem}>
          <div className={styles.countdownValue}>{timeLeft.hours}</div>
          <div className={styles.countdownLabel}>Hours</div>
        </div>
        <div className={styles.countdownItem}>
          <div className={styles.countdownValue}>{timeLeft.minutes}</div>
          <div className={styles.countdownLabel}>Minutes</div>
        </div>
        <div className={styles.countdownItem}>
          <div className={styles.countdownValue}>{timeLeft.seconds}</div>
          <div className={styles.countdownLabel}>Seconds</div>
        </div>
      </div>
      
      <div className={styles.workshopActions}>
        <Link href={workshop.link}>
          <button className={styles.joinButton}>Join Workshop</button>
        </Link>
        <Link href={`${workshop.link}/materials`} className={styles.materialsLink}>
          View preparatory materials
        </Link>
      </div>
    </div>
  );
} 