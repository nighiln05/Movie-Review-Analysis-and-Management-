import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ExplorePage from './components/ExplorePage';
import SearchMovies from './components/SearchMovies';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/search" element={<SearchMovies />} />
        <Route path="/" element={<Navigate to="/explore" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
