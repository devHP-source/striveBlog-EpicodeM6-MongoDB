import React from "react"
import NavBar from "./components/navbar/BlogNavbar"
import Footer from "./components/footer/Footer"
import ProtectedRoute from "./components/protected-route/ProtectedRoute"
import Home from "./views/home/Home"
import Blog from "./views/blog/Blog"
import NewBlogPost from "./views/new/New"
import Authors from "./views/authors/Authors"
import Login from "./views/login/Login"
import Register from "./views/register/Register"
import NotFound from "./views/not-found/NotFound"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}> {/* queste pagine si vedono solo dopo il login */}
          <Route path="/" element={<Home />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/new" element={<NewBlogPost />} />
          <Route path="/authors" element={<Authors />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
