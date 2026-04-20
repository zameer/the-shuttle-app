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
      <DialogContent className="w-full max-w-full h-dvh sm:max-w-lg sm:h-auto rounded-none sm:rounded-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Request Callback</DialogTitle>
        </DialogHeader>
        <CallbackRequestForm onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
