import { Route, Routes } from "react-router-dom";
import './App.css';
import Home from "./components/Home";
import Video from "./components/Video";
import NotAllowed from "./components/NotAllowed";
import Widget from "./components/Widget";

function App() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<Video />} />
        <Route path="/not-allowed" element={<NotAllowed />} />
        <Route path="/widget" element={<Widget />} />
      </Routes>
    </div>
  );
}

export default App;
