import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const RubricDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rubric, setRubric] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        const token = localStorage.getItem('prograde_token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }
        const res = await fetch(`http://localhost:3001/api/rubrics/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Failed to fetch rubric')
        }
        const data = await res.json()
        setRubric(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRubric()
  }, [id])

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-indigo-700 mb-4">← Back</button>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">Loading rubric...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        ) : !rubric ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">Rubric not found.</div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{rubric.title}</h1>
                {rubric.description && <p className="text-gray-600 mt-1">{rubric.description}</p>}
              </div>
              {rubric.isDefault ? (
                <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full h-fit">Default</span>
              ) : (
                <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full h-fit">Custom</span>
              )}
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Criteria</h2>
            <div className="divide-y">
              {(rubric.criteria || []).map((c) => (
                <div key={c.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{c.name}</div>
                    {c.description && <div className="text-sm text-gray-600 mt-0.5">{c.description}</div>}
                  </div>
                  <div className="text-sm text-gray-700">Max: {c.maxScore}</div>
                </div>
              ))}
              {(!rubric.criteria || rubric.criteria.length === 0) && (
                <div className="text-sm text-gray-600 py-3">No criteria defined.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RubricDetails


