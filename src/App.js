import React from "react"
import NavBar from "./components/navbar/BlogNavbar"
import Footer from "./components/footer/Footer"
import Home from "./views/home/Home"
import Blog from "./views/blog/Blog"
import NewBlogPost from "./views/new/New"
import Authors from "./views/authors/Authors"
import NotFound from "./views/not-found/NotFound"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/new" element={<NewBlogPost />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
