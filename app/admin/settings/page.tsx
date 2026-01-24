'use client';

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
import { Shield, Bell, Settings, Server } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Admin Settings</h1>
        <p className="text-lg text-muted-foreground font-light">Manage system-wide settings and configuration</p>
      </div>

      {/* System Configuration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>Configure core system settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              defaultValue="MonitorHub"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMonitors">Max Monitors Per User</Label>
            <Input
              id="maxMonitors"
              type="number"
              defaultValue="100"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInterval">Default Check Interval (minutes)</Label>
            <Select defaultValue="5">
              <SelectTrigger id="checkInterval" className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-accent hover:bg-accent/90">Save Configuration</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Configure security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox id="twoFactor" defaultChecked />
              <Label htmlFor="twoFactor" className="font-normal cursor-pointer">
                Require 2FA for all users
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="ipWhitelist" />
              <Label htmlFor="ipWhitelist" className="font-normal cursor-pointer">
                Enable IP whitelist for admin panel
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="sessionTimeout" defaultChecked />
              <Label htmlFor="sessionTimeout" className="font-normal cursor-pointer">
                Auto logout inactive sessions (30 min)
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="auditLogs" defaultChecked />
              <Label htmlFor="auditLogs" className="font-normal cursor-pointer">
                Enable detailed audit logging
              </Label>
            </div>
          </div>
          <Button className="bg-accent hover:bg-accent/90">Save Security Settings</Button>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              defaultValue="smtp.example.com"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                defaultValue="587"
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                defaultValue="noreply@example.com"
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <Button className="bg-accent hover:bg-accent/90">Save Email Settings</Button>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Configuration
          </CardTitle>
          <CardDescription>Configure alert thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="responseThreshold">Response Time Threshold (ms)</Label>
            <Input
              id="responseThreshold"
              type="number"
              defaultValue="3000"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downtimeThreshold">Downtime Alert Threshold (seconds)</Label>
            <Input
              id="downtimeThreshold"
              type="number"
              defaultValue="60"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertCooldown">Alert Cooldown Period (minutes)</Label>
            <Input
              id="alertCooldown"
              type="number"
              defaultValue="5"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <Button className="bg-accent hover:bg-accent/90">Save Alert Settings</Button>
        </CardContent>
      </Card>

      {/* Backup & Recovery */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Backup & Recovery</CardTitle>
          <CardDescription>Manage system backups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Last backup: 2 hours ago • Next scheduled backup: Tomorrow at 2:00 AM
          </p>
          <div className="flex gap-2">
            <Button variant="outline">Create Backup Now</Button>
            <Button variant="outline">View Backups</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
