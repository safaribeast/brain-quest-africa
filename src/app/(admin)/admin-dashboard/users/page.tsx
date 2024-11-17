import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8" />
            <div>
              <h3 className="font-semibold">Total Users</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          User management features coming soon...
        </div>
      </Card>
    </div>
  );
}
