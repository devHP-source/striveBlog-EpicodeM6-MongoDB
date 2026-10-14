import React, { useEffect, useState } from "react"
import { Container, Image } from "react-bootstrap"
import { useNavigate, useParams } from "react-router-dom"
import BlogAuthor from "../../components/blog/blog-author/BlogAuthor"
import BlogLike from "../../components/likes/BlogLike"
import "./styles.css"

const API_URL = "http://localhost:9099"

const Blog = props => {
  const [blog, setBlog] = useState({})
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const response = await fetch(`${API_URL}/blogPosts/${id}`)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        setBlog(await response.json())
        setLoading(false)
      } catch (error) {
        console.error(error)
        navigate("/404", { replace: true })
      }
    }
    loadBlog()
  }, [id, navigate])

  if (loading) {
    return <div>loading</div>
  } else {
    return (
      <div className="blog-details-root">
        <Container>
          <Image className="blog-details-cover" src={blog.cover} fluid />
          <h1 className="blog-details-title">{blog.title}</h1>

          <div className="blog-details-container">
            <div className="blog-details-author">
              <BlogAuthor name={blog.author} />
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
              __html: blog.content,
            }}
          ></div>
        </Container>
      </div>
    )
  }
}

export default Blog
