'use client'

import { useEffect, useState } from 'react'
import Pagination from '../../components/ui/molecules/Pagination'
import api from '../../api'

const PAGE_SIZE = 5

export default function VisitorsTable() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 🔹 Fake API call
const fetchVisitors = async (page) => {
  try {
    setLoading(true)

    const res = await api.get(
      `/visitors?page=${page}&limit=${PAGE_SIZE}`
    )

    const data = await res.data
    // console.info(data,"viss")
    setData(data?.visitors)
    setTotalPages(data.totalPages)
  } catch (error) {
    console.error('Error fetching visitors:', error)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchVisitors(page)
  }, [page])

  return (
    <div className="bg-white rounded-lg border border-[#979797]/30 p-4">
      {/* <h2 className="text-lg font-semibold mb-4 text-[#979797]">
        Visitors
      </h2> */}

      {/* TABLE */}
      <div className="overflow-x-auto">
 <table className="w-full text-sm">
  <thead>
    <tr className="text-left border-b border-[#979797]/30 text-[#979797]">
      <th className="py-2">IP</th>
      <th>Country</th>
      <th>City</th>
      <th>Region</th>
      <th>Device</th>
      <th>Browser</th>
      <th>OS</th>
      <th>Page</th>
      <th>Referrer</th>
      <th>Time</th>
    </tr>
  </thead>

  <tbody>
    {loading ? (
      <tr>
        <td colSpan="10" className="py-6 text-center text-[#979797]">
          Loading...
        </td>
      </tr>
    ) : data.length === 0 ? (
      <tr>
        <td colSpan="10" className="py-6 text-center text-[#979797]">
          No visitors found
        </td>
      </tr>
    ) : (
      data.map((v) => (
        <tr
          key={v._id}
          className="border-b border-[#979797]/20 hover:bg-[#b695f8]/10 transition"
        >
          <td className="py-2">{v.ip}</td>
          <td>{v.country}</td>
          <td>{v.city}</td>
          <td>{v.region}</td>
          <td>{v.device}</td>
          <td>{v.browser}</td>
          <td>{v.os}</td>

          {/* Page (truncate long paths) */}
          <td className="max-w-[120px] truncate" title={v.page}>
            {v.page}
          </td>

          {/* Referrer (truncate + clickable) */}
          <td className="max-w-[150px] truncate">
            {v.referrer ? (
              <a
                href={v.referrer}
                target="_blank"
                className="text-[#b695f8] hover:underline"
              >
                {v.referrer}
              </a>
            ) : (
              '-'
            )}
          </td>

          {/* Time */}
          <td>
            {new Date(v.createdAt).toLocaleString()}
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  )
}