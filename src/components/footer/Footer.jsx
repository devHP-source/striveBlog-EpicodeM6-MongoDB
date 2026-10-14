import React from "react"
import { Container } from "react-bootstrap"

const Footer = (props) => {
  return (
    <footer
      style={{
        paddingTop: 50,
        paddingBottom: 50,
      }}
    >
      <Container>
        {`${new Date().getFullYear()} - &copy; Strive School | Developed by devByPau`} 
      </Container>
    </footer>
  )
}

export default Footer
