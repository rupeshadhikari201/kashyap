"use client";

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, User, Lock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  phone_no: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      company_name: user?.company_name || '',
      phone_no: user?.phone_no || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      await userAPI.updateProfile(data);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      await userAPI.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      console.log('Change password error:', error);
      console.log('Error response data:', error.response?.data.error);
      const message = error.response?.data?.error || error.response?.data?.msg || 'Failed to change password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger value="account">
            <Shield className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and company information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...profileForm.register('full_name')}
                    placeholder="Dhukre Don"
                  />
                  {profileForm.formState.errors.full_name && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    {...profileForm.register('company_name')}
                    placeholder="ABC Consultancy"
                  />
                  {profileForm.formState.errors.company_name && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.company_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_no">Phone Number</Label>
                  <Input
                    id="phone_no"
                    {...profileForm.register('phone_no')}
                    placeholder="+977 9812345678"
                  />
                  {profileForm.formState.errors.phone_no && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.phone_no.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email} disabled />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is using a strong password
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                
                {/* ----- Current Password ----- */}
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrent ? 'text' : 'password'}
                      {...passwordForm.register('current_password')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.current_password && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.current_password.message}
                    </p>
                  )}
                </div>

                {/* ----- New Password ----- */}
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNew ? 'text' : 'password'}
                      {...passwordForm.register('new_password')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.new_password && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.new_password.message}
                    </p>
                  )}
                </div>

                {/* ----- Confirm Password ----- */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirm ? 'text' : 'password'}
                      {...passwordForm.register('confirm_password')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <Badge className="capitalize">
                    {user?.role?.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification Status</p>
                  <Badge variant={user?.is_verified ? 'default' : 'destructive'}>
                    {user?.is_verified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User ID</p>
                  <p className="font-medium font-mono text-sm">{user?.id}</p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-2">Account Permissions</h3>
                <div className="space-y-2 text-sm">
                  {user?.role === 'admin' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Full access to all features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Can create, read, update, and delete applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Can manage user accounts</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Can create new applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Can read applicant records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Can update applicant information</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span>Cannot delete applicants</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}