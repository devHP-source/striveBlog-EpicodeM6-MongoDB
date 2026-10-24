import React, { useEffect, useRef, useState } from "react"
import { Alert, Button, Container, Form } from "react-bootstrap"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import GoogleButton from "../../components/google-button/GoogleButton"
import { API_URL } from "../../config"

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const googleTokenRequested = useRef(false) // il cookie con il token vale una volta sola, ma in sviluppo StrictMode esegue l'effetto due volte

  useEffect(() => { // dopo il login con Google il backend rimanda qui con ?google=success oppure ?error=google
    const showGoogleError = (message = "accesso con Google annullato o non completato, riprova") => {
      setErrorMessage(message)
      navigate("/login", { replace: true }) // toglie ?error=... dall'indirizzo: se si ricarica la pagina, il messaggio non torna
    }
    const loadGoogleToken = async () => { // il token è in un cookie che solo il backend può leggere
      try {
        const response = await fetch(`${API_URL}/auth/google/token`, {
          method: "POST",
          credentials: "include", // manda al backend il cookie del login con Google
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message) // es: "Google login expired, please try again"
        }
        localStorage.setItem("token", result.accessToken)
        navigate("/", { replace: true }) // replace: ?google=success non resta nella cronologia
      } catch (error) {
        console.error(error)
        showGoogleError()
      }
    }
    if (searchParams.get("google") === "success" && !googleTokenRequested.current) { // una sola richiesta, anche se l'effetto parte due volte
      googleTokenRequested.current = true
      loadGoogleToken()
    }
    if (searchParams.get("error") === "google") { // login con Google annullato o non riuscito
      showGoogleError()
    }
    if (searchParams.get("error") === "google-email") { // l'email è già di un account con password: Google lo apre solo dopo "Collega Google"
      showGoogleError("questa email è già registrata con una password. Accedi con email e password, poi clicca «Collega Google» nella barra in alto")
    }
    if (searchParams.get("error") === "google-linked") { // "Collega Google" con un account Google che apre già un altro autore
      showGoogleError("questo account Google è già collegato a un altro autore")
    }
  }, [searchParams, navigate])

  const handleInputChange = event => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setErrorMessage("")
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message) // es: "Wrong email or password"
      }
      localStorage.setItem("token", result.accessToken) // il token serve per tutte le altre richieste
      navigate("/") // dopo il login si va alla home
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message)
    }
  }

  return (
    <Container fluid="sm">
      <h1 className="blog-main-title mb-3">Accedi</h1>
      <Form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        {errorMessage && <Alert variant="danger">{`Login non riuscito: ${errorMessage}`}</Alert>}
        <Form.Group controlId="login-email" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            size="lg"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="login-password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            size="lg"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button type="submit" size="lg" variant="dark">
            Accedi
          </Button>
          <GoogleButton />
        </div>
      </Form>
      <p className="mt-4">
        Non hai un account? <Link to="/register">Registrati</Link>
      </p>
    </Container>
  )
}

export default Login
