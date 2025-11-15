import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation'

const initialCriteria = [
  { name: 'Weekly Progress & Reporting', description: 'Evaluates consistency, discipline, and communication throughout the semester.', maxScore: 20 },
  { name: 'Final SGP Report', description: 'Assesses the quality and completeness of the final project documentation.', maxScore: 30 },
  { name: 'Final Presentation & Viva Voce', description: "Evaluates the team's ability to present their work and defend it during the review.", maxScore: 30 },
  { name: 'Overall Project Quality & Outcome', description: 'Assesses the final product itself—the result of all the work done.', maxScore: 20 },
]

const CustomRubric = ({ redirectBase = '/faculty/rubrics' }) => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('My Custom Rubric')
  const [description, setDescription] = useState('A personalized evaluation rubric based on SGP official template.')
  const [criteria, setCriteria] = useState(initialCriteria)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateCriterion = (index, field, value) => {
    setCriteria(prev => prev.map((c, i) => i === index ? { ...c, [field]: field === 'maxScore' ? Number(value) : value } : c))
  }

  const addCriterion = () => {
    setCriteria(prev => [...prev, { name: '', description: '', maxScore: 0 }])
  }

  const removeCriterion = (index) => {
    setCriteria(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      const token = localStorage.getItem('prograde_token')
      if (!token) {
        setError('Not authenticated')
        setSaving(false)
        return
      }
      const body = { title, description, criteria }
      const res = await fetch('http://localhost:3001/api/rubrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to create rubric')
      navigate(`${redirectBase}/${data.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="mb-4">
          <BreadcrumbNavigation />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Create Custom Rubric</h1>
          <button onClick={() => navigate(-1)} className="text-indigo-700">Cancel</button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" rows={3} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Criteria</h2>
              <button onClick={addCriterion} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded">Add criterion</button>
            </div>
            <div className="space-y-4">
              {criteria.map((c, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">Criterion {i+1}</div>
                    <button onClick={() => removeCriterion(i)} className="text-sm text-red-600">Remove</button>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700">Name</label>
                      <input value={c.name} onChange={e => updateCriterion(i, 'name', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Max Score</label>
                      <input type="number" min={0} value={c.maxScore} onChange={e => updateCriterion(i, 'maxScore', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700">Description</label>
                      <textarea value={c.description} onChange={e => updateCriterion(i, 'description', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={2} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg ${saving ? 'opacity-70' : ''}`}>
              {saving ? 'Saving...' : 'Save Rubric'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomRubric


