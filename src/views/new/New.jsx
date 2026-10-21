import React, { useCallback, useState } from "react"
import { Alert, Button, Container, Form } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import "./styles.css"
import draftToHtml from "draftjs-to-html"
import { API_URL } from "../../config"

const initialForm = {
  title: "",
  category: "Categoria 1",
  cover: "",
  readTime: 1,
}

const NewBlogPost = props => {
  const [text, setText] = useState("")
  const [formData, setFormData] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  const handleChange = useCallback(value => {
    setText(draftToHtml(value))
  }, [])

  const handleInputChange = event => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setErrorMessage("")
    try {
      const response = await fetch(`${API_URL}/blogPosts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // il token salvato al login
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          cover: formData.cover,
          readTime: { value: Number(formData.readTime), unit: "minute" },
          content: text, // l'autore lo prende il backend dal token
        }),
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message) // es. "Token missing, please login"
      }
      navigate("/") // torna alla home, dove si vede il nuovo articolo
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message)
    }
  }

  return (
    <Container className="new-blog-container">
      <Form className="mt-5" onSubmit={handleSubmit} onReset={() => setFormData(initialForm)}>
        {errorMessage && <Alert variant="danger">{`Impossibile pubblicare l'articolo: ${errorMessage}`}</Alert>}
        <Form.Group controlId="blog-form" className="mt-3">
          <Form.Label>Titolo</Form.Label>
          <Form.Control
            size="lg"
            placeholder="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="blog-category" className="mt-3">
          <Form.Label>Categoria</Form.Label>
          <Form.Select
            size="lg"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option>Categoria 1</option>
            <option>Categoria 2</option>
            <option>Categoria 3</option>
            <option>Categoria 4</option>
            <option>Categoria 5</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="blog-cover" className="mt-3">
          <Form.Label>Copertina (link immagine)</Form.Label>
          <Form.Control
            size="lg"
            type="url"
            placeholder="https://..."
            name="cover"
            value={formData.cover}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="blog-read-time" className="mt-3">
          <Form.Label>Tempo di lettura (minuti)</Form.Label>
          <Form.Control
            size="lg"
            type="number"
            min="1"
            name="readTime"
            value={formData.readTime}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="blog-content" className="mt-3">
          <Form.Label>Contenuto Blog</Form.Label>

          <Editor value={text} onChange={handleChange} className="new-blog-content" />
        </Form.Group>
        <Form.Group className="d-flex mt-3 justify-content-end">
          <Button type="reset" size="lg" variant="outline-dark">
            Reset
          </Button>
          <Button
            type="submit"
            size="lg"
            variant="dark"
            style={{
              marginLeft: "1em",
            }}
          >
            Invia
          </Button>
        </Form.Group>
      </Form>
    </Container>
  )
}

export default NewBlogPost
