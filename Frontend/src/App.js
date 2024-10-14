import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Main from './pages/Main';
import Navs from './components/Navs';
import CCTV from './pages/Cctv';
import ErrorPage from './pages/ErrorPage';
import Member from './pages/Member';
import Jensong from './pages/Jensong';
import Alim from './pages/Alim';
import Login from './pages/Login';
import Map from './pages/Map';
import Register from './pages/Register';
import MyPage from './pages/MyPage';

function App() {
  const location = useLocation();
  const hiddenPaths = ['/', '/Register'];

  return (
    <div className="App">
       {!hiddenPaths.includes(location.pathname) && <Navs />} 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/CCTV" element={<CCTV />} />
        <Route path="/Error" element={<ErrorPage />} />
        <Route path="/Member" element={<Member />} />
        <Route path="/Jeons" element={<Jensong />} />
        <Route path="/Alims" element={<Alim />} />
        <Route path="/Main" element={<Main /> } />
        <Route path='/Map' element={<Map/>}/>
        <Route path='/Register' element={<Register/>}/>
        <Route path='/MyPage' element={<MyPage/>}/>

      </Routes>
    </div>
  );
}

export default App;
