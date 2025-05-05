import Link from 'next/link';
import { FaUsers, FaBook, FaCalendarAlt, FaToolbox, FaClipboardList } from 'react-icons/fa';
import styles from './adminMenu.module.css';

interface AdminNavigationMenuProps {
  activePage?: string;
}

export default function AdminNavigationMenu({ activePage }: AdminNavigationMenuProps) {
  return (
    <nav className={styles.adminNav}>
      <ul className={styles.adminNavList}>
        <li className={activePage === 'dashboard' ? styles.active : ''}>
          <Link href="/admin/dashboard">
            <span className={styles.icon}><FaToolbox /></span>
            <span className={styles.label}>Dashboard</span>
          </Link>
        </li>
        <li className={activePage === 'users' ? styles.active : ''}>
          <Link href="/admin/users">
            <span className={styles.icon}><FaUsers /></span>
            <span className={styles.label}>Users</span>
          </Link>
        </li>
        <li className={activePage === 'courses' ? styles.active : ''}>
          <Link href="/admin/courses">
            <span className={styles.icon}><FaBook /></span>
            <span className={styles.label}>Courses</span>
          </Link>
        </li>
        <li className={activePage === 'workshops' ? styles.active : ''}>
          <Link href="/admin/workshops">
            <span className={styles.icon}><FaCalendarAlt /></span>
            <span className={styles.label}>Workshops</span>
          </Link>
        </li>
        <li className={activePage === 'homework' ? styles.active : ''}>
          <Link href="/admin/homework-manager">
            <span className={styles.icon}><FaClipboardList /></span>
            <span className={styles.label}>Homework Manager</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
} 