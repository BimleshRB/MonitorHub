'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthCheck } from '@/hooks/use-auth-check';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bell, Shield, Palette, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading } = useAuthCheck();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    slackAlerts: false,
    smsAlerts: false,
    weeklyReport: true,
    incident: true,
    maintenance: true,
  });

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
      });
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const res = await fetch('/api/auth/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.preferences || notifications);
      }
    } catch (error) {
      console.error('Failed to load notification preferences', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/auth/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update settings');
      }

      toast({
        title: 'Success',
        description: 'Notification settings updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/auth/account', { method: 'DELETE' });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      toast({
        title: 'Success',
        description: 'Account deleted. Redirecting to login...',
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-lg text-muted-foreground font-light">Manage your account preferences and notifications</p>
      </div>

      {/* Profile Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-secondary/50 border-border/50 cursor-not-allowed opacity-60"
              />
            </div>
          </div>
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-accent hover:bg-accent/90"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how you receive alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-foreground">Email Alerts</p>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Checkbox
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailAlerts: checked as boolean })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-foreground">Slack Integration</p>
                <p className="text-sm text-muted-foreground">Send alerts to Slack workspace</p>
              </div>
              <Checkbox
                checked={notifications.slackAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, slackAlerts: checked as boolean })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-foreground">SMS Alerts</p>
                <p className="text-sm text-muted-foreground">Get critical alerts via SMS</p>
              </div>
              <Checkbox
                checked={notifications.smsAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, smsAlerts: checked as boolean })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-foreground">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
              </div>
              <Checkbox
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyReport: checked as boolean })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-foreground">Incident Notifications</p>
                <p className="text-sm text-muted-foreground">Alert on incidents and downtime</p>
              </div>
              <Checkbox
                checked={notifications.incident}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, incident: checked as boolean })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-foreground">Maintenance Alerts</p>
                <p className="text-sm text-muted-foreground">Notify about scheduled maintenance</p>
              </div>
              <Checkbox
                checked={notifications.maintenance}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, maintenance: checked as boolean })
                }
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveNotifications}
            disabled={isSaving}
            className="bg-accent hover:bg-accent/90"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Currently using: <span className="font-medium capitalize">{theme} mode</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive w-full">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all associated monitors, incidents, and data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive mb-4">
                ⚠️ All monitors will stop checking immediately. Your data will be permanently erased.
              </div>
              <div className="flex gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isSaving ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
