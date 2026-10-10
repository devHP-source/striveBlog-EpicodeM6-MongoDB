import React from "react"
import { Button, Container } from "react-bootstrap"
import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <Container fluid="sm">
      <h1 className="blog-main-title mb-3">404 - Pagina non trovata</h1>
      <Button as={Link} to="/" variant="dark">
        Torna alla home
      </Button>
    </Container>
  )
}

export default NotFound
