import { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useBookingAgents, useDeleteBookingAgent } from './useBookingAgents'
import BookingAgentForm from './BookingAgentForm'
import type { BookingAgent } from './types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

export default function BookingAgentConfigPage() {
  const { isSuperAdmin } = useAuth()
  const { data: agents = [], isLoading } = useBookingAgents()
  const deleteMutation = useDeleteBookingAgent()

  const [formOpen, setFormOpen] = useState(false)
  const [editAgent, setEditAgent] = useState<BookingAgent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BookingAgent | null>(null)

  if (!isSuperAdmin) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-base font-medium">Access restricted.</p>
        <p className="text-sm mt-1">Only super-admins can manage Booking Agents.</p>
      </div>
    )
  }

  const openCreate = () => {
    setEditAgent(null)
    setFormOpen(true)
  }

  const openEdit = (agent: BookingAgent) => {
    setEditAgent(agent)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.email)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Booking Agents</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage agents who handle player callback requests.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          Add Booking Agent
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
      ) : agents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500">
          <p className="text-sm">No Booking Agents configured yet.</p>
          <p className="text-xs mt-1">Click "Add Booking Agent" to create one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Work Phone</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Primary</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Priority</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Available</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {agents.map((agent) => (
                <tr key={agent.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{agent.display_name}</td>
                  <td className="px-4 py-3 text-gray-600">{agent.email}</td>
                  <td className="px-4 py-3 text-gray-600">{agent.work_phone}</td>
                  <td className="px-4 py-3 text-center">
                    {agent.is_primary ? (
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Primary
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{agent.priority_order}</td>
                  <td className="px-4 py-3 text-center">
                    {agent.is_available ? (
                      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Available
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(agent)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        aria-label={`Edit ${agent.display_name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(agent)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Delete ${agent.display_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(open: boolean) => { if (!open) setFormOpen(false) }}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{editAgent ? 'Edit Booking Agent' : 'Add Booking Agent'}</DialogTitle>
          </DialogHeader>
          <BookingAgentForm
            agent={editAgent}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open: boolean) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete Booking Agent</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to remove{' '}
            <strong>{deleteTarget?.display_name}</strong> as a Booking Agent? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
