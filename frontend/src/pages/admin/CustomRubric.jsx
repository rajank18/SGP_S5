import React from 'react'
import FacultyCustomRubric from '../faculty/CustomRubric'
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation'

// Reuse the form but redirect within admin namespace after save
const AdminCustomRubric = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <BreadcrumbNavigation />
      </div>
      <FacultyCustomRubric redirectBase="/admin/rubrics" />
    </div>
  )
}

export default AdminCustomRubric


