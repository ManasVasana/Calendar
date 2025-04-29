import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Mainpage from './pages/MainPage.jsx';
import SignUp from './pages/SignUp.jsx';
import React from 'react';

export default function App() {

  return (
    <div className="bg-[#000000] min-h-screen">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Mainpage" element={<Mainpage />} />
      </Routes>
    </div>
  );
}
