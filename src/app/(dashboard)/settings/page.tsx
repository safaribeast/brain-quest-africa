import { SettingsForm } from "@/components/settings/settings-form"

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6">
          <SettingsForm />
        </div>
      </div>
    </div>
  )
} 