import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import Profile from "./components/Profile";
import Home from "./components/Home";
import AddPost from "./components/AddPost";
import SignIn from "./components/SignIn";
import { User as FirebaseUser } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";
import BottomTabBar from "./components/BottomTabBar";

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app flex flex-col min-h-screen">
        <main className="flex-grow">
          {user ? (
            <Routes>
              <Route path="/add-post" element={<AddPost />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/add-post" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
        {user && <BottomTabBar />}
      </div>
    </Router>
  );
};

export default App;