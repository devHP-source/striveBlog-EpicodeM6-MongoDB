import React from "react"
import { Col, Image, Row } from "react-bootstrap"
import "./styles.css"

const BlogAuthor = props => {
  const { name, avatar } = props
  return (
    <Row>
      {avatar && ( // i post salvano solo l'email dell'autore e quindi l'avatar può mancare
        <Col
        xs={"auto"}
        className="pe-0"
        >
          <Image
          className="blog-author"
          src={avatar} alt={name} roundedCircle />
        </Col>
      )}
      <Col>
        <div>di</div>
        <h6>{name}</h6>
      </Col>
    </Row>
  )
}

export default BlogAuthor
