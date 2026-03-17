import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Browse from "./pages/Browse";
import GameDetails from "./pages/GameDetails";
import MyLibrary from "./pages/MyLibrary";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/game/:id" element={<GameDetails />} />
        <Route path="/library" element={<MyLibrary />} />
      </Routes>
    </BrowserRouter>
  );
}