import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { adminOpsAPI } from '../../api'
import Card from '../Card'
import Modal from '../Modal'

const formatCellValue = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const AdminResourceCard = ({ title, resourceKey, idField = 'id', samplePayload = {} }) => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [currentId, setCurrentId] = useState(null)
  const [payloadText, setPayloadText] = useState('')
  const [saving, setSaving] = useState(false)

  const columns = useMemo(() => {
    if (!rows.length) return []
    return Object.keys(rows[0]).filter((key) => key !== 'password').slice(0, 6)
  }, [rows])

  const getRowId = (row) => row?.[idField] ?? row?.id ?? row?.jti

  const parseRows = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.results)) return data.results
    return []
  }

  const parseError = (error, fallback) => {
    const detail = error?.response?.data
    if (!detail) return fallback
    if (typeof detail === 'string') return detail
    return Object.entries(detail)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join(' | ')
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await adminOpsAPI.list(resourceKey)
      setRows(parseRows(response.data))
    } catch (error) {
      toast.error(parseError(error, `Failed to load ${title}`))
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [resourceKey])

  const openCreate = () => {
    setDialogMode('create')
    setCurrentId(null)
    setPayloadText(JSON.stringify(samplePayload, null, 2))
    setDialogOpen(true)
  }

  const openEdit = (row) => {
    const rowId = getRowId(row)
    if (!rowId && rowId !== 0) {
      toast.error('Record ID is missing')
      return
    }
    setDialogMode('edit')
    setCurrentId(rowId)
    setPayloadText(JSON.stringify(row, null, 2))
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setPayloadText('')
    setCurrentId(null)
  }

  const handleSave = async () => {
    let payload
    try {
      payload = JSON.parse(payloadText)
    } catch {
      toast.error('Invalid JSON payload')
      return
    }

    try {
      setSaving(true)
      if (dialogMode === 'create') {
        await adminOpsAPI.create(resourceKey, payload)
        toast.success(`${title}: created`)
      } else {
        await adminOpsAPI.update(resourceKey, currentId, payload)
        toast.success(`${title}: updated`)
      }
      closeDialog()
      await loadData()
    } catch (error) {
      toast.error(parseError(error, 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    const rowId = getRowId(row)
    if (!rowId && rowId !== 0) {
      toast.error('Record ID is missing')
      return
    }

    if (!window.confirm(`Delete this ${title} record?`)) return

    try {
      await adminOpsAPI.remove(resourceKey, rowId)
      toast.success(`${title}: deleted`)
      await loadData()
    } catch (error) {
      toast.error(parseError(error, 'Delete failed'))
    }
  }

  return (
    <>
      <Card
        title={title}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  {columns.map((column) => (
                    <th key={column} className="text-left px-2 py-2 font-semibold text-gray-700">
                      {column}
                    </th>
                  ))}
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 12).map((row, index) => (
                  <tr key={`${getRowId(row) ?? index}`} className="border-b border-gray-100">
                    {columns.map((column) => (
                      <td key={column} className="px-2 py-2 text-gray-700 max-w-[180px] truncate">
                        {formatCellValue(row[column])}
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1 px-2 py-1 border border-blue-200 rounded text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="inline-flex items-center gap-1 px-2 py-1 border border-red-200 rounded text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={dialogOpen}
        onClose={closeDialog}
        title={dialogMode === 'create' ? `Create ${title}` : `Edit ${title}`}
        size="lg"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Use JSON payload for full field-level control.</p>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="w-full h-80 border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            spellCheck={false}
          />
          <div className="flex justify-end gap-2">
            <button onClick={closeDialog} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AdminResourceCard
