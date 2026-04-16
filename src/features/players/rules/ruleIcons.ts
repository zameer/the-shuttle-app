import {
  ShieldCheck,
  VolumeX,
  Shirt,
  Volume2,
  Clock,
  Users,
  Music,
  MessageSquareOff,
  Footprints,
  type LucideIcon,
} from 'lucide-react'

export const RULE_ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  VolumeX,
  Shirt,
  Volume2,
  Clock,
  Users,
  Music,
  MessageSquareOff,
  Footprints,
}

export const DEFAULT_RULE_ICON: LucideIcon = ShieldCheck

export const RULE_ICON_OPTIONS = Object.keys(RULE_ICON_MAP)
