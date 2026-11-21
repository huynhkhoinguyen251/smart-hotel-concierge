import { createContext } from 'react';

// Giá trị do NotificationsProvider (NotificationsContext.jsx) cung cấp; đọc bằng hook useNotifications.
const NotificationsContext = createContext(null);

export default NotificationsContext;
