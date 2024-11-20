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
import { useState, createContext } from 'react';
import RegisterUser from './pages/RegisterUser';
import RegisterStore from './pages/RegisterStore';
import MainMaster from './pages/MainMaster';
import { jwtDecode } from 'jwt-decode';
import MemberMaster from './pages/MemberMaster';
import BoardMaster from './pages/BoardMaster';
import DetailPage from './pages/DetaPage';
import AlimMaster from './pages/AlimMaster';


// Appdata context 생성
export const Appdata = createContext(null);

function App({ children }) {  // children을 props로 받기
  const location = useLocation();
  const [showMapModal, setShowMapModal] = useState(false); // 모달 상태 추가

  const handleShowMap = () => setShowMapModal(true); // 모달 열기
  const handleCloseMap = () => setShowMapModal(false); // 모달 닫기
  const [user, setUser] = useState({});
  const [store, setStore] = useState({});

  const hiddenPaths = ['/', '/RegisterUser','/RegisterStore', '/Findaccount'];
  
  const token = localStorage.getItem('jwtToken');

  return (
    <div className="App">
      <Appdata.Provider value={{ user, setUser, store, setStore }}>
        {children} {/* children 사용 */}

        {!hiddenPaths.includes(location.pathname) && <Navs />}

        {!hiddenPaths.includes(location.pathname) && (
          <div className="map-icon-container" onClick={handleShowMap}>
            <FaMap size={24} className="map-icon" />
            <span className="map-label">지도</span>
          </div>
        )}

        <Modal show={showMapModal} onHide={handleCloseMap} centered size="lg">
          <Modal.Header style={{background:"#1F316F", color: 'white'}} closeButton>
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
          <Route path="/MemberMaster" element={<MemberMaster />} />

          {/* <Route path="/Jeons" element={<Jensong />} /> */}
          <Route path="/Alims" element={<Alim />} />
          <Route path="/Main" element={<Main />} />
          <Route path="/MainMaster" element={<MainMaster />} />
          <Route path="/BoardMaster" element={<BoardMaster />} />
          <Route path="/community/posts/:post_id" element={<DetailPage />} />
          <Route path="/AlimsMaster" element={<AlimMaster />} />




          {/* <Route path='/Map' element={<Map/>}/> */}
          <Route path='/RegisterUser' element={<RegisterUser />} />
          <Route path='/RegisterStore' element={<RegisterStore />} />

          <Route path='/MyPage' element={<MyPage />} />
          <Route path='/Findaccount' element={<FindAccount />} />
        </Routes>
      </Appdata.Provider>
    </div>
  );
}

export default App;
