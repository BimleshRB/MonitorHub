'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Shield, Palette, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    slackAlerts: false,
    smsAlerts: false,
    weeklyReport: true,
    incident: true,
    maintenance: true,
  });

  const [theme, setTheme] = useState('dark');

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
                defaultValue="John Doe"
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john@example.com"
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              defaultValue="Acme Corp"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="flex gap-3">
            <Button className="bg-accent hover:bg-accent/90">Save Changes</Button>
            <Button variant="outline">Change Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Alert Channels</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="email"
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailAlerts: checked as boolean })
                  }
                />
                <Label htmlFor="email" className="font-normal cursor-pointer">
                  Email Alerts
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="slack"
                  checked={notifications.slackAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, slackAlerts: checked as boolean })
                  }
                />
                <Label htmlFor="slack" className="font-normal cursor-pointer">
                  Slack Notifications
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="sms"
                  checked={notifications.smsAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsAlerts: checked as boolean })
                  }
                />
                <Label htmlFor="sms" className="font-normal cursor-pointer">
                  SMS Alerts (Critical Only)
                </Label>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 pt-6">
            <h3 className="font-semibold text-foreground mb-4">Notification Types</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="incident"
                  checked={notifications.incident}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, incident: checked as boolean })
                  }
                />
                <Label htmlFor="incident" className="font-normal cursor-pointer">
                  Incident Alerts
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="maintenance"
                  checked={notifications.maintenance}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, maintenance: checked as boolean })
                  }
                />
                <Label htmlFor="maintenance" className="font-normal cursor-pointer">
                  Maintenance Notifications
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="weekly"
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyReport: checked as boolean })
                  }
                />
                <Label htmlFor="weekly" className="font-normal cursor-pointer">
                  Weekly Reports
                </Label>
              </div>
            </div>
          </div>

          <Button className="bg-accent hover:bg-accent/90">Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Display
          </CardTitle>
          <CardDescription>Customize your appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme" className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-accent hover:bg-accent/90">Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
