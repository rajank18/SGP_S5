import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // base segment: admin | faculty | student | etc.
  const baseSegment = pathnames[0] || 'admin';
  const baseDashboard = `/${baseSegment}/dashboard`;

  // Define custom names for routes
  const breadcrumbNameMap = {
    courses: 'Courses',
    faculty: 'Faculty',
    assignments: 'Assignments',
    students: 'Students',
  };

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <Link to={baseDashboard} className="flex items-center gap-1.5 hover:text-blue-600">
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      {pathnames.map((value, index) => {
        // Hide the base segment (e.g., 'admin' or 'faculty')
        if (index === 0) {
          return null;
        }

        // For faculty course detail pages, hide the intermediate 'courses' segment
        if (baseSegment === 'faculty' && index === 1 && value === 'courses' && pathnames.length >= 3) {
          return null;
        }

        const to = `/${baseSegment}/${pathnames.slice(1, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-4 w-4 mx-1" />
            {isLast ? (
              <span className="font-medium text-gray-700">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-blue-600">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNavigation;