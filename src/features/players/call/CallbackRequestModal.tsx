import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import CallbackRequestForm from './CallbackRequestForm'

interface CallbackRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CallbackRequestModal({ isOpen, onClose }: CallbackRequestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose() }}>
      <DialogContent className="w-full max-w-full sm:max-w-lg overflow-y-auto max-h-[90vh]" showCloseButton>
        <DialogHeader>
          <DialogTitle>Request Callback</DialogTitle>
        </DialogHeader>
        <CallbackRequestForm onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  )
}
