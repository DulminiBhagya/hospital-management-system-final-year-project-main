import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './Pages/LoginForm'
import AdminDashboard from './Pages/admin/AdminDashboard'
import AdminLogin from './Pages/AdminLogin'
import AdminProtectedRoute from './Pages/admin/protected-routes/adminProtectedRoute'
import ClinicDashboard from './Pages/Clinic/nurs/ClinicDashboard'
<<<<<<< HEAD
import WardDashboard from './Pages/ward/WardDashboard'
import DialysisDashboard from './Pages/Dialysis/DialysisDashboard'
import PharmacyDashboard from './Pages/pharmacy/PharmacyDashboard'
=======
import DoctorManagement from './Pages/admin/DoctorManagement'
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1

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
<<<<<<< HEAD
        
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/ClinicManagement' element={<ClinicDashboard/>}/>
        <Route path='/wardManagement' element={<WardDashboard/>}/>
        <Route path='/dialysisManagement' element={<DialysisDashboard/>}/>
        <Route path='/pharmacyManagement' element={<PharmacyDashboard/>}/>
=======

        <Route path='/admin/doctors' element={
          <AdminProtectedRoute>
            <DoctorManagement/>
          </AdminProtectedRoute>
        }/>
        
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/ClinicManagement' element={<ClinicDashboard/>}/>
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
      </Routes>
    </Router>
  )
}

export default App
