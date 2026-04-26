import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-8xl font-bold text-gray-800 mb-4">404</p>
        <h2 className="text-white text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-gray-400 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist</p>
        <Link
          href="/projects"
          className="inline-block bg-white text-gray-950 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
