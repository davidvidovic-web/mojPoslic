import { useTranslations } from 'next-intl'

export function useCommonTranslations() {
  return useTranslations('common')
}

export function useNavigationTranslations() {
  return useTranslations('navigation')
}

export function useDashboardTranslations() {
  return useTranslations('dashboard')
}

export function useJobsTranslations() {
  return useTranslations('jobs')
}

export function useMessagingTranslations() {
  return useTranslations('messaging')
}

export function useFormTranslations() {
  return useTranslations('common.forms')
}

export function useButtonTranslations() {
  return useTranslations('common.buttons')
}

export function useStatusTranslations() {
  return useTranslations('common.status')
}

export function useTimeTranslations() {
  return useTranslations('common.time')
}
