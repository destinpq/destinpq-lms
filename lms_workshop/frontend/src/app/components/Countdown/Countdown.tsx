'use client';

import { useState, useEffect } from 'react';
import styles from './countdown.module.css';

interface CountdownProps {
  targetDate: Date;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      // Time calculations
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    }, 1000);

    // Run once to set initial values
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    
    if (distance > 0) {
      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
    }

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={styles.countdownGrid}>
      <div className={styles.countdownItem}>
        <div className={styles.countdownNumber}>{days}</div>
        <div className={styles.countdownLabel}>Days</div>
      </div>
      <div className={styles.countdownItem}>
        <div className={styles.countdownNumber}>{hours}</div>
        <div className={styles.countdownLabel}>Hours</div>
      </div>
      <div className={styles.countdownItem}>
        <div className={styles.countdownNumber}>{minutes}</div>
        <div className={styles.countdownLabel}>Minutes</div>
      </div>
      <div className={styles.countdownItem}>
        <div className={styles.countdownNumber}>{seconds}</div>
        <div className={styles.countdownLabel}>Seconds</div>
      </div>
    </div>
  );
} 