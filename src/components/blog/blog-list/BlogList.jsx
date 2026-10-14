import React, { useEffect, useState } from "react"
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap"
import BlogItem from "../blog-item/BlogItem"

const API_URL = "http://localhost:9099"
const PER_PAGE = 6

const BlogList = (props) => {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("") // testo scritto nella barra di ricerca
  const [title, setTitle] = useState("") // titolo cercato, usato nella fetch
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(
          `${API_URL}/blogPosts?page=${page}&perPage=${PER_PAGE}&title=${encodeURIComponent(title)}`,
        )
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const result = await response.json()
        setPosts(result.data)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error(error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadPosts()
  }, [page, title])

  const handleSearch = (event) => {
    event.preventDefault()
    setTitle(search)
    setPage(1) // una nuova ricerca riparte dalla prima pagina
  }

  return (
    <>
      <Form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
        <Form.Control
          type="search"
          placeholder="Cerca per titolo"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button type="submit" variant="dark">
          Cerca
        </Button>
      </Form>

      {isLoading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading posts...</span>
        </Spinner>
      )}
      {hasError && (
        <Alert variant="danger">Impossibile caricare gli articoli</Alert>
      )}
      {!isLoading && !hasError && posts.length === 0 && (
        <p>Nessun articolo trovato</p>
      )}

      <Row>
        {posts.map((post) => (
          <Col
            key={post._id}
            md={4}
            style={{
              marginBottom: 50,
            }}
          >
            <BlogItem {...post} />
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
            Precedente
          </Button>
          <span>{`Pagina ${page} di ${totalPages}`}</span>
          <Button
            variant="outline-dark"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Successiva
          </Button>
        </div>
      )}
    </>
  )
}

export default BlogList
