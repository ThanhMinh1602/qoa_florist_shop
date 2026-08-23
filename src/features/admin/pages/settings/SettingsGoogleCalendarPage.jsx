import { useCallback, useState } from 'react'
import GoogleCalendarSettingsSection from '../../components/GoogleCalendarSettingsSection'
import SettingsSubpageShell from '../../components/settings/SettingsSubpageShell'

function SettingsGoogleCalendarPage() {
  const [actions, setActions] = useState(null)
  const bindActions = useCallback((node) => {
    setActions(node)
  }, [])

  return (
    <SettingsSubpageShell
      title="Google Calendar"
      description="Kết nối, Calendar ID, Gmail share và giờ nhắc."
      actions={actions}
    >
      <GoogleCalendarSettingsSection bindActions={bindActions} />
    </SettingsSubpageShell>
  )
}

export default SettingsGoogleCalendarPage
