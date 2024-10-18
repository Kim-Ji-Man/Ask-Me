import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Main from './pages/Main';
import Navs from './components/Navs';
import CCTV from './pages/Cctv';
import ErrorPage from './pages/ErrorPage';
import Member from './pages/Member';
// import Jensong from './pages/Jensong';
import Alim from './pages/Alim';
import Login from './pages/Login';
import Map from './pages/Map';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import FindAccount from './pages/FindAccount';
import { FaMap } from 'react-icons/fa'; 
import { Modal } from 'react-bootstrap';
import { useState,createContext } from 'react';

function App() {
  const location = useLocation();
  const [showMapModal, setShowMapModal] = useState(false); // 모달 상태 추가

  const handleShowMap = () => setShowMapModal(true); // 모달 열기
  const handleCloseMap = () => setShowMapModal(false); // 모달 닫기
  const [user,setUser] = useState({nick :'냉면'});
  const [store,setStore] = useState({nick :'냉면'});


  const hiddenPaths = ['/', '/Register', '/Findaccount'];

  return (
    <div className="App">
      {/* <Appdata.Provider value={{ user, setUser, store, setStore }}>
      {children}
    </Appdata.Provider> */}

       {!hiddenPaths.includes(location.pathname) && <Navs />} 

     {!hiddenPaths.includes(location.pathname) && (
        <div className="map-icon-container" onClick={handleShowMap}>
          <FaMap size={24} className="map-icon" />
          <span className="map-label">지도</span>
        </div>
      )}

<Modal show={showMapModal} onHide={handleCloseMap} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>지도</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Map /> {/* Map 컴포넌트 렌더링 */}
        </Modal.Body>
      </Modal>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/CCTV" element={<CCTV />} />
        <Route path="/Error" element={<ErrorPage />} />
        <Route path="/Member" element={<Member />} />
        {/* <Route path="/Jeons" element={<Jensong />} /> */}
        <Route path="/Alims" element={<Alim />} />
        <Route path="/Main" element={<Main /> } />
        {/* <Route path='/Map' element={<Map/>}/> */}
        <Route path='/Register' element={<Register/>}/>
        <Route path='/MyPage' element={<MyPage/>}/>
        <Route path='/Findaccount' element={<FindAccount/>}/>

      </Routes>
    </div>
  );
}

export default App;
