"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { applicantAPI } from '@/lib/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Save, X, Download, Trash2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const applicantSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Valid phone number required'),
  interested_course: z.enum(['Bachelors', 'Masters', 'Phd']),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipcode: z.string().min(3, 'Zipcode is required'),
  street: z.string().min(3, 'Street is required'),
  academics: z.array(z.object({
    degree_level: z.enum(['Intermediate', 'Bachelors', 'Masters']),
    degree_title: z.string().min(2, 'Degree title is required'),
    institution: z.string().min(2, 'Institution is required'),
    passed_year: z.string().min(4, 'Passed year is required'),
    course_start_date: z.string().min(1, 'Start date is required'),
    course_end_date: z.string().min(1, 'End date is required'),
    obtained_mark: z.string().min(1, 'Obtained mark is required'),
  })).min(1, 'At least one academic record is required'),
  test_type: z.enum(['IELTS', 'PTE', 'TOEFL']),
  overall_score: z.string().min(1, 'Overall score is required'),
  reading_score: z.string().min(1, 'Reading score is required'),
  listening_score: z.string().min(1, 'Listening score is required'),
  writing_score: z.string().min(1, 'Writing score is required'),
  speaking_score: z.string().min(1, 'Speaking score is required'),
  attended_date: z.string().min(1, 'Attended date is required'),
});

type ApplicantForm = z.infer<typeof applicantSchema>;

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newDocument, setNewDocument] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, control, setValue, reset } = useForm<ApplicantForm>({
    resolver: zodResolver(applicantSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'academics',
  });

  useEffect(() => {
    fetchApplicant();
  }, [params.id]);

  const fetchApplicant = async () => {
    try {
      const response = await applicantAPI.getById(params.id as string);
      setApplicant(response.data);
      
      // Populate form with existing data
      const data = response.data;
      reset({
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        interested_course: data.interested_course,
        country: data.country,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
        street: data.street,
        academics: data.academics || [],
        test_type: data.test_type,
        overall_score: data.overall_score,
        reading_score: data.reading_score,
        listening_score: data.listening_score,
        writing_score: data.writing_score,
        speaking_score: data.speaking_score,
        attended_date: data.attended_date,
      });
    } catch (error) {
      toast.error('Failed to fetch applicant details');
      console.error('Failed to fetch applicant:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ApplicantForm) => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'academics') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      if (newDocument) {
        formData.append('document', newDocument);
      }

      const response = await applicantAPI.update(params.id as string, formData);
      setApplicant(response.data);
      setEditing(false);
      setNewDocument(null);
      toast.success('Applicant updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update applicant';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await applicantAPI.delete(params.id as string);
      toast.success('Applicant deleted successfully');
      router.push('/dashboard/applicants');
    } catch (error) {
      toast.error('Failed to delete applicant');
      console.error('Failed to delete applicant:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setNewDocument(file);
    }
  };

  const canEdit = true
  const canDelete = true;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Applicant not found</h3>
        <Link href="/dashboard/applicants">
          <Button variant="outline">Back to Applicants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/applicants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{applicant.full_name}</h1>
            <p className="text-muted-foreground mt-1">Applicant Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing && canEdit && (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {editing && (
            <>
              <Button variant="outline" onClick={() => {
                setEditing(false);
                setNewDocument(null);
                reset();
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
          {!editing && canDelete && (
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="scores">Test Scores</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details about the applicant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" {...register('full_name')} />
                    {errors.full_name && (
                      <p className="text-sm text-destructive">{errors.full_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input id="phone_number" {...register('phone_number')} />
                    {errors.phone_number && (
                      <p className="text-sm text-destructive">{errors.phone_number.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Interested Course *</Label>
                    <Select
                      onValueChange={(value) => setValue('interested_course', value as any)}
                      defaultValue={applicant.interested_course}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bachelors">Bachelors</SelectItem>
                        <SelectItem value="Masters">Masters</SelectItem>
                        <SelectItem value="Phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="font-medium">{applicant.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{applicant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                    <p className="font-medium">{applicant.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Interested Course</p>
                    <Badge>{applicant.interested_course}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Location details of the applicant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" {...register('country')} />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" {...register('city')} />
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input id="state" {...register('state')} />
                      {errors.state && (
                        <p className="text-sm text-destructive">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Zipcode *</Label>
                    <Input id="zipcode" {...register('zipcode')} />
                    {errors.zipcode && (
                      <p className="text-sm text-destructive">{errors.zipcode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street *</Label>
                    <Input id="street" {...register('street')} />
                    {errors.street && (
                      <p className="text-sm text-destructive">{errors.street.message}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Country</p>
                    <p className="font-medium">{applicant.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">City</p>
                    <p className="font-medium">{applicant.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">State/Province</p>
                    <p className="font-medium">{applicant.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Zipcode</p>
                    <p className="font-medium">{applicant.zipcode}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Street Address</p>
                    <p className="font-medium">{applicant.street}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academics" className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Academic Record {index + 1}</CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Degree Level *</Label>
                      <Select
                        onValueChange={(value) => setValue(`academics.${index}.degree_level`, value as any)}
                        defaultValue={field.degree_level}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Bachelors">Bachelors</SelectItem>
                          <SelectItem value="Masters">Masters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Degree Title *</Label>
                      <Input {...register(`academics.${index}.degree_title`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution *</Label>
                      <Input {...register(`academics.${index}.institution`)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Passed Year *</Label>
                        <Input {...register(`academics.${index}.passed_year`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Obtained Mark (%) *</Label>
                        <Input {...register(`academics.${index}.obtained_mark`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Course Start Date *</Label>
                        <Input type="date" {...register(`academics.${index}.course_start_date`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Course End Date *</Label>
                        <Input type="date" {...register(`academics.${index}.course_end_date`)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    degree_level: 'Bachelors',
                    degree_title: '',
                    institution: '',
                    passed_year: '',
                    course_start_date: '',
                    course_end_date: '',
                    obtained_mark: '',
                  })
                }
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Academic Record
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applicant.academics?.map((academic: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {academic.degree_title}
                    </CardTitle>
                    <CardDescription>{academic.institution}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Degree Level</p>
                        <Badge variant="outline">{academic.degree_level}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Passed Year</p>
                        <p className="font-medium">{academic.passed_year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Course Duration</p>
                        <p className="font-medium">
                          {new Date(academic.course_start_date).toLocaleDateString()} -{' '}
                          {new Date(academic.course_end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Obtained Mark</p>
                        <p className="font-medium">{academic.obtained_mark}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Scores</CardTitle>
              <CardDescription>Language proficiency test results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Test Type *</Label>
                    <Select
                      onValueChange={(value) => setValue('test_type', value as any)}
                      defaultValue={applicant.test_type}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IELTS">IELTS</SelectItem>
                        <SelectItem value="PTE">PTE</SelectItem>
                        <SelectItem value="TOEFL">TOEFL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overall_score">Overall Score *</Label>
                    <Input id="overall_score" {...register('overall_score')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reading_score">Reading *</Label>
                      <Input id="reading_score" {...register('reading_score')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="listening_score">Listening *</Label>
                      <Input id="listening_score" {...register('listening_score')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="writing_score">Writing *</Label>
                      <Input id="writing_score" {...register('writing_score')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="speaking_score">Speaking *</Label>
                      <Input id="speaking_score" {...register('speaking_score')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attended_date">Test Date *</Label>
                    <Input type="date" id="attended_date" {...register('attended_date')} />
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Badge className="text-lg px-4 py-2">{applicant.test_type}</Badge>
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <p className="text-3xl font-bold">{applicant.overall_score}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Reading</p>
                      <p className="text-2xl font-bold">{applicant.reading_score}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Listening</p>
                      <p className="text-2xl font-bold">{applicant.listening_score}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Writing</p>
                      <p className="text-2xl font-bold">{applicant.writing_score}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Speaking</p>
                      <p className="text-2xl font-bold">{applicant.speaking_score}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Test Date</p>
                    <p className="font-medium">
                      {new Date(applicant.attended_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Uploaded application documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicant.document_url ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Application Document</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <a href={applicant.document_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              ) : (
                <p className="text-muted-foreground">No document uploaded</p>
              )}

              {editing && (
                <div className="space-y-2">
                  <Label htmlFor="new_document">Upload New Document (Optional)</Label>
                  <Input
                    id="new_document"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  {newDocument && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {newDocument.name}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {applicant.full_name}'s
              record and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}