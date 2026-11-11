import { createContext } from 'react';

// Giá trị do AuthProvider (AuthContext.jsx) cung cấp; đọc bằng hook useAuth.
const AuthContext = createContext(null);

export default AuthContext;
