import './App.css'
import Login from './components/Login'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Register from './components/Register'
import ObjectDetection from './components/ObjectDetection'
import WeaponDetection from './components/WeaponDetection'
import ViolenceDetection from './components/ViolenceDetection'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<ObjectDetection />} />
        <Route path='/weapondetect' element={<WeaponDetection/>} />
        <Route path='/violencedetect' element={<ViolenceDetection/>} />
      </Routes>
    </>
  )
}

export default App
