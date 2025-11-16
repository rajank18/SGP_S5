import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation'
import { apiFetch } from '@/lib/api'

const Rubrics = () => {
  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const token = localStorage.getItem('prograde_token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }
        const res = await apiFetch('/api/rubrics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Failed to fetch rubrics')
        }
        const data = await res.json()
        setRubrics(Array.isArray(data.rubrics) ? data.rubrics : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRubrics()
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <BreadcrumbNavigation />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Rubrics</h1>
        </div>
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">Loading rubrics...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rubrics.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-gray-600 col-span-full">No rubrics available.</div>
            ) : (
              rubrics.map(r => (
                <div key={r.id} className="bg-white rounded-xl shadow p-6 flex flex-col cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate(`/faculty/rubrics/${r.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{r.title}</h3>
                      {r.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{r.description}</p>
                      )}
                    </div>
                    {r.isDefault ? (
                      <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full h-fit">Default</span>
                    ) : (
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full h-fit">Custom</span>
                    )}
                  </div>
                  <div className="mt-4 text-sm text-indigo-700">View details →</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Rubrics


