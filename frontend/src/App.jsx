import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './Pages/LoginForm'
import AdminDashboard from './Pages/admin/AdminDashboard'
import AdminLogin from './Pages/AdminLogin'
import AdminProtectedRoute from './Pages/admin/protected-routes/adminProtectedRoute'
import ClinicDashboard from './Pages/Clinic/nurs/ClinicDashboard'
import DoctorManagement from './Pages/admin/DoctorManagement'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm/>} />

        <Route path='/admin-dashboard' element={
          <AdminProtectedRoute>
            <AdminDashboard/>
          </AdminProtectedRoute>
        }/>

        <Route path='/admin/doctors' element={
          <AdminProtectedRoute>
            <DoctorManagement/>
          </AdminProtectedRoute>
        }/>
        
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/ClinicManagement' element={<ClinicDashboard/>}/>
      </Routes>
    </Router>
  )
}

export default App
