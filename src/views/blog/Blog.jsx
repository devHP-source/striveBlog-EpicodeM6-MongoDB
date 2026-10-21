import React, { useEffect, useState } from "react"
import { Alert, Container, Image } from "react-bootstrap"
import { useNavigate, useParams } from "react-router-dom"
import BlogAuthor from "../../components/blog/blog-author/BlogAuthor"
import DOMPurify from "dompurify"
import BlogLike from "../../components/likes/BlogLike"
import { API_URL } from "../../config"
import "./styles.css"

const Blog = props => {
  const [blog, setBlog] = useState({})
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const response = await fetch(`${API_URL}/blogPosts/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // il token salvato al login
        })
        if (response.status === 404 || response.status === 400) { // post inesistente o id non valido
          navigate("/404", { replace: true })
          return
        }
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        setBlog(await response.json())
        setLoading(false)
      } catch (error) {
        console.error(error)
        setHasError(true) // es. backend spento: non è un 404
      }
    }
    loadBlog()
  }, [id, navigate])

  if (hasError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Impossibile caricare l'articolo</Alert>
      </Container>
    )
  } else if (loading) {
    return <div>loading</div>
  } else {
    return (
      <div className="blog-details-root">
        <Container>
          <Image className="blog-details-cover" src={blog.cover} fluid />
          <h1 className="blog-details-title">{blog.title}</h1>

          <div className="blog-details-container">
            <div className="blog-details-author">
              <BlogAuthor name={`${blog.author.name} ${blog.author.surname}`} avatar={blog.author.avatar} />
            </div>
            <div className="blog-details-info">
              <div>{new Date(blog.createdAt).toLocaleDateString()}</div>
              <div>{`lettura da ${blog.readTime.value} ${blog.readTime.unit}`}</div>
              <div
                style={{
                  marginTop: 20,
                }}
              >
                <BlogLike defaultLikes={["123"]} onChange={console.log} />
              </div>
            </div>
          </div>

          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(blog.content), // toglie script e attributi pericolosi dall'HTML del post
            }}
          ></div>
        </Container>
      </div>
    )
  }
}

export default Blog
