import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and preferences
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Settings className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-semibold">General Settings</h3>
              <p className="text-muted-foreground">
                Configure general system settings
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Settings configuration coming soon...
          </div>
        </Card>
      </div>
    </div>
  );
}
