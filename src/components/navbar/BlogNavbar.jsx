import React, { useEffect, useState } from "react"
import { Button, Container, Image, Navbar } from "react-bootstrap"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import logo from "../../assets/logo.png"
import { API_URL } from "../../config"
import "./css/BlogNavbar.css"
const NavBar = (props) => {
  const [user, setUser] = useState(null) // l'utente loggato, preso da GET /me
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { // ad ogni cambio di pagina, così si aggiorna anche dopo il login
    const token = localStorage.getItem("token")
    if (!token) {
      setUser(null)
      return
    }
    const loadMe = async () => {
      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 401) { // token scaduto o non valido
          localStorage.removeItem("token")
          setUser(null)
          navigate("/login")
          return
        }
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        setUser(await response.json())
      } catch (error) {
        console.error(error)
      }
    }
    loadMe()
  }, [location.pathname, navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    navigate("/login")
  }

  const handleLinkGoogle = async () => { // "Collega Google": il backend salva chi sei in un cookie, poi si passa da Google
    try {
      const response = await fetch(`${API_URL}/auth/google/link`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        credentials: "include", // per ricevere il cookie del collegamento
      })
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      window.location.href = `${API_URL}/auth/google?link=1` // al ritorno da Google l'account Google è collegato a questo autore
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Navbar expand="lg" className="blog-navbar" fixed="top">
      <Container className="justify-content-between">
        <Navbar.Brand as={Link} to="/">
          <img className="blog-navbar-brand" alt="logo" src={logo} />
        </Navbar.Brand>

        {user ? (
          <div className="d-flex align-items-center gap-2">
            <Button as={Link} to="/authors" variant="outline-dark" size="lg">
              Authors
            </Button>
            <Button
              as={Link}
              to="/new"
              className="blog-navbar-add-button bg-dark"
              size="lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16"
              >
                <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z" />
              </svg>
              Nuovo Articolo
            </Button>
            <Image
              className="blog-navbar-avatar ms-2"
              src={user.avatar}
              alt={`${user.name} ${user.surname}`}
              roundedCircle
            />
            <span className="fw-bold">{user.name}</span>
            {!user.googleLinked && ( // solo gli account con password: dopo il collegamento "Continua con Google" apre questo account
              <Button variant="outline-dark" size="lg" onClick={handleLinkGoogle}>
                <FcGoogle className="me-2" />
                Collega Google
              </Button>
            )}
            <Button variant="outline-danger" size="lg" onClick={handleLogout}>
              Esci
            </Button>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Button as={Link} to="/login" variant="outline-dark" size="lg">
              Accedi
            </Button>
            <Button as={Link} to="/register" variant="dark" size="lg">
              Registrati
            </Button>
          </div>
        )}
      </Container>
    </Navbar>
  )
}

export default NavBar
