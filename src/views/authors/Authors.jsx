import React, { useEffect, useState } from "react"
import { Alert, Card, Col, Container, Image, Row, Spinner } from "react-bootstrap"
import "./styles.css"

const API_URL = "http://localhost:9099"

const Authors = () => {
  const [authors, setAuthors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const response = await fetch(`${API_URL}/authors`)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        setAuthors(await response.json())
      } catch (error) {
        console.error(error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadAuthors()
  }, [])

  return (
    <Container fluid="sm">
      <h1 className="blog-main-title mb-3">Authors</h1>
      {isLoading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading authors...</span>
        </Spinner>
      )}
      {hasError && <Alert variant="danger">Could not load authors</Alert>}
      {!isLoading && !hasError && authors.length === 0 && <p>No authors yet</p>}
      <Row>
        {authors.map((author) => (
          <Col key={author._id} sm={6} md={4} lg={3} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <Image
                  className="author-avatar mb-3"
                  src={author.avatar}
                  alt={`${author.name} ${author.surname}`}
                  roundedCircle
                />
                <Card.Title>{`${author.name} ${author.surname}`}</Card.Title>
                <Card.Text className="mb-1">{author.email}</Card.Text>
                <Card.Text className="text-muted">{`Born ${author.dob}`}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Authors
