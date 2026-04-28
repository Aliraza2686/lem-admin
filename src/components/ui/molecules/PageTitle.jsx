import { ChevronRightIcon } from '@heroicons/react/20/solid'

export default function PageTitle({ title, path = [] }) {
  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      {path.length > 0 && (
        <nav className="flex items-center text-sm text-gray-500 mb-2">
          {path.map((item, index) => (
            <div key={index} className="flex items-center">
              {index !== 0 && (
                <ChevronRightIcon className="mx-2 size-4 text-gray-400" />
              )}

              {item.href ? (
                <a href={item.href} className="hover:text-gray-700">
                  {item.name}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
    </div>
  )
}