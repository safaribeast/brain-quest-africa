import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <ProfileForm />
      </div>
    </div>
  )
} 