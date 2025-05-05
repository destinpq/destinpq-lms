'use client';

import styles from './ActionButtons.module.css';
import { EditOutlined, EyeOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

interface ActionButtonsProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  extraActions?: MenuProps['items'];
}

export default function ActionButtons({ onEdit, onView, onDelete, extraActions }: ActionButtonsProps) {
  const defaultItems: MenuProps['items'] = [];
  
  if (onEdit) {
    defaultItems.push({
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: onEdit
    });
  }
  
  if (onView) {
    defaultItems.push({
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View',
      onClick: onView
    });
  }
  
  if (onDelete) {
    defaultItems.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: onDelete
    });
  }
  
  const items = [...defaultItems, ...(extraActions || [])];
  
  return (
    <div className={styles.actionButtons}>
      {onEdit && (
        <button 
          className={styles.actionButton} 
          onClick={onEdit}
          title="Edit"
        >
          <EditOutlined />
        </button>
      )}
      
      {onView && (
        <button 
          className={`${styles.actionButton} ${styles.viewButton}`} 
          onClick={onView}
          title="View"
        >
          <EyeOutlined />
        </button>
      )}
      
      {items.length > 0 && (
        <Dropdown 
          menu={{ items }} 
          trigger={['click']}
          placement="bottomRight"
        >
          <button className={styles.actionButton} title="More actions">
            <EllipsisOutlined />
          </button>
        </Dropdown>
      )}
    </div>
  );
} 