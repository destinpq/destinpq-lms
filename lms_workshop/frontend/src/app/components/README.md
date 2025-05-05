# LMS Admin Components

## SharedSidebar

The SharedSidebar component provides a consistent navigation sidebar for all admin pages, including a logout button that will remain on all pages.

## AdminTemplate

The AdminTemplate is a wrapper component that ensures all admin pages have a consistent layout with the SharedSidebar.

### Usage

When creating a new admin page, always use the AdminTemplate component to ensure consistent layout and sidebar functionality:

```tsx
'use client';

import AdminTemplate from '@/app/components/AdminTemplate/AdminTemplate';
import styles from './your-module.css';

export default function YourAdminPage() {
  return (
    <AdminTemplate activeItem="your-page-id">
      <div className={styles.header}>
        <h1>Your Page Title</h1>
        {/* Your header controls */}
      </div>
      
      {/* Your main content */}
      <div className={styles.yourContent}>
        {/* Your page content */}
      </div>
    </AdminTemplate>
  );
}
```

### Props

- `activeItem`: Required string - the ID of the active menu item. Should match one of:
  - `dashboard`
  - `workshops`
  - `courses`
  - `schedule`
  - `homework`
  - `achievements`
  - `messages`
  - `users`
  - `analytics`
  - `settings`

### CSS Modules

When using the AdminTemplate, your page CSS module only needs to define styles for your content, not the overall layout or sidebar.

The AdminTemplate automatically applies:
- Full height layout
- Sidebar positioning
- Content area with proper padding and margin

### Logout Functionality

The logout button in the SharedSidebar will:
1. Remove the access token from localStorage
2. Remove any admin overrides from localStorage
3. Redirect to the login page

This functionality is consistent across all admin pages when using the AdminTemplate. 