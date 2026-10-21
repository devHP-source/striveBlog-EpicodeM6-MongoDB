import React, { useState } from "react"
import { Alert, Button, Container, Form } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { API_URL } from "../../config"

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

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
        throw new Error(result.message) // es. "Wrong email or password"
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
        <Button type="submit" size="lg" variant="dark">
          Accedi
        </Button>
      </Form>
      <p className="mt-4">
        Non hai un account? <Link to="/register">Registrati</Link>
      </p>
    </Container>
  )
}

export default Login
