import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { RegistroEstudiantePage } from './pages/RegistroEstudiante'
import { RegistroPersonalPage } from './pages/RegistroPersonal'
import { LoginPage } from './pages/Login'
import { ConsentimientoPage } from './pages/Consentimiento'
import { EncuestaWHO5Page } from './pages/EncuestaWHO5'
import { ResultadoPage } from './pages/Resultado'
import { DashboardPage } from './pages/dashboard/Dashboard'
import { AlertasPage } from './pages/dashboard/Alertas'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/registro/estudiante" element={<RegistroEstudiantePage />} />
        <Route path="/registro/personal" element={<RegistroPersonalPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/consentimiento" element={
          <ProtectedRoute>
            <ConsentimientoPage />
          </ProtectedRoute>
        } />
        
        <Route path="/encuesta" element={
          <ProtectedRoute>
            <EncuestaWHO5Page />
          </ProtectedRoute>
        } />
        
        <Route path="/resultado/:id" element={
          <ProtectedRoute>
            <ResultadoPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'psicologo', 'analista']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/alertas" element={
          <ProtectedRoute allowedRoles={['admin', 'psicologo']}>
            <AlertasPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
