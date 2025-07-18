'use client'

import BrandSection from '@/components/login/BrandSection'
import LoginForm from '@/components/login/LoginForm'

const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      <BrandSection />
      <LoginForm />
    </div>
  )
}

export default LoginPage