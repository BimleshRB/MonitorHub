import { redirect } from 'next/navigation'

export default function MonitorsRedirectPage() {
  // Redirect legacy /monitors to the main dashboard monitors page
  redirect('/dashboard/monitors')
}
