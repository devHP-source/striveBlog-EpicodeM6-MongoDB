import React, { useState } from "react"
import { Alert, Button, Container, Form } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import GoogleButton from "../../components/google-button/GoogleButton"
import { API_URL } from "../../config"

const initialForm = {
  name: "",
  surname: "",
  email: "",
  dob: "",
  password: "",
}

const Register = () => {
  const [formData, setFormData] = useState(initialForm)
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
      const response = await fetch(`${API_URL}/authors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${formData.name} ${formData.surname}`)}`, // avatar con le iniziali
        }),
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message) // es: "Email already in use"
      }
      navigate("/login") // registrato, ora può fare il login
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message)
    }
  }

  return (
    <Container fluid="sm">
      <h1 className="blog-main-title mb-3">Registrati</h1>
      <Form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        {errorMessage && <Alert variant="danger">{`Registrazione non riuscita: ${errorMessage}`}</Alert>}
        <Form.Group controlId="register-name" className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            size="lg"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="register-surname" className="mb-3">
          <Form.Label>Cognome</Form.Label>
          <Form.Control
            size="lg"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="register-email" className="mb-3">
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
        <Form.Group controlId="register-dob" className="mb-3">
          <Form.Label>Data di nascita</Form.Label>
          <Form.Control
            size="lg"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="register-password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            size="lg"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            minLength={8}
            required
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button type="submit" size="lg" variant="dark">
            Registrati
          </Button>
          <GoogleButton />
        </div>
      </Form>
      <p className="mt-4">
        Hai già un account? <Link to="/login">Accedi</Link>
      </p>
    </Container>
  )
}

export default Register
