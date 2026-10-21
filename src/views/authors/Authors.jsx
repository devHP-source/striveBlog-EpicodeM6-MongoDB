import React, { useEffect, useState } from "react"
import { Alert, Button, Card, Col, Container, Image, Row, Spinner} from "react-bootstrap"
import { API_URL } from "../../config"
import "./styles.css"

const PER_PAGE = 12

const Authors = () => {
  const [authors, setAuthors] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let ignore = false // diventa true se page cambia prima che arrivi la risposta
    const loadAuthors = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(`${API_URL}/authors?page=${page}&perPage=${PER_PAGE}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // il token salvato al login
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const result = await response.json()
        if (!ignore) { // una risposta vecchia non sovrascrive quella nuova
          setAuthors(result.data) // la lista è dentro "data" (risposta paginata)
          setTotalPages(result.totalPages)
        }
      } catch (error) {
        console.error(error)
        if (!ignore) setHasError(true)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    loadAuthors()
    return () => {
      ignore = true
    }
  }, [page])

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

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mb-5">
          <Button
            variant="outline-dark"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>{`Page ${page} of ${totalPages}`}</span>
          <Button
            variant="outline-dark"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </Container>
  )
}

export default Authors
