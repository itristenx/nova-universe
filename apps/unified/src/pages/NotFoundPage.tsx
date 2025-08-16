import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-gray-600">Page not found</p>
        <Link to="/dashboard" className="btn btn-primary mt-4">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
