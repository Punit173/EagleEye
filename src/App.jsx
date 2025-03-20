import './App.css'
import Login from './components/Login'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Register from './components/Register'
import ObjectDetection from './components/ObjectDetection'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<ObjectDetection />} />
      </Routes>
    </>
  )
}

export default App
