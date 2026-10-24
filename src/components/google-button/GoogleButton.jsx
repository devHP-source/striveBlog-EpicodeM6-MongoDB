import React from "react"
import { Button } from "react-bootstrap"
import { FcGoogle } from "react-icons/fc"
import { API_URL } from "../../config"

const GoogleButton = () => { // login e registrazione con Google: la prima volta il backend crea l'account
  return (
    <Button href={`${API_URL}/auth/google`} size="lg" variant="outline-dark">
      <FcGoogle className="me-2" />
      Continua con Google
    </Button>
  )
}

export default GoogleButton
