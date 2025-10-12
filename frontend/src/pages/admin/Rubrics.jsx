import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminRubrics = () => {
  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const fetchRubrics = async () => {
    try {
      const token = localStorage.getItem('prograde_token')
      const res = await fetch('http://localhost:3001/api/rubrics', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to fetch rubrics')
      setRubrics(Array.isArray(data.rubrics) ? data.rubrics : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRubrics()
  }, [])

  const handleDeleteRubric = async (e, rubricId, rubricTitle) => {
    e.stopPropagation() // Prevent navigation to rubric details
    
    if (!window.confirm(`Are you sure you want to delete "${rubricTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(rubricId)
    try {
      const token = localStorage.getItem('prograde_token')
      const res = await fetch(`http://localhost:3001/api/rubrics/${rubricId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || 'Failed to delete rubric')
      
      toast.success('Rubric deleted successfully')
      fetchRubrics() // Refresh the list
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <BreadcrumbNavigation />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Rubrics</h1>
          <button onClick={() => navigate('/admin/rubrics/custom')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm">Create rubric</button>
        </div>
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">Loading…</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rubrics.map((r, idx) => (
              <motion.div
                key={r.id}
                className="bg-white rounded-xl p-6 cursor-pointer border border-transparent hover:border-blue-200 shadow-sm hover:shadow-md transition-colors relative"
                onClick={() => navigate(`/admin/rubrics/${r.id}`)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.03 * idx }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{r.title}</h3>
                    {r.description && <p className="text-sm text-gray-600 mt-1 line-clamp-3">{r.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {r.isDefault ? (
                      <span className="text-[10px] font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full h-fit whitespace-nowrap">Default</span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full h-fit whitespace-nowrap">Custom</span>
                    )}
                    <button
                      onClick={(e) => handleDeleteRubric(e, r.id, r.title)}
                      disabled={deleting === r.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                      title="Delete rubric"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-700">View details →</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRubrics


