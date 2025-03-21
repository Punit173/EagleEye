import './App.css'
import Login from './components/Login'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Register from './components/Register'
import ObjectDetection from './components/ObjectDetection'
import WeaponDetection from './components/WeaponDetection'
import ViolenceDetection from './components/ViolenceDetection'
import SuspiciousActivityDetector from './components/SuspiciousActivityDetector'
import Dashboard from './components/Dashboard'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/objdetect' element={<ObjectDetection />} />
        <Route path='/weapondetect' element={<WeaponDetection />} />
        <Route path='/violence' element={<ViolenceDetection />} />
        <Route path='/sadetect' element={<SuspiciousActivityDetector />} />
      </Routes>
    </>
  )
}

export default App
