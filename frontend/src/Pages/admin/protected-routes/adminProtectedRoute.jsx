import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
    const userRole = localStorage.getItem('role');

    if(userRole !== 'ADMIN'){
        return <Navigate to="/admin-login" replace />;
    }

    return children;
}

export default AdminProtectedRoute;