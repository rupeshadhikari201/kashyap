"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { applicantAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, Plus, Trash2, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const applicantSchema = z.object({
  // Personal Info
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Valid phone number required'),
  interested_course: z.enum(['Bachelors', 'Masters', 'Phd']),
  
  // Address
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipcode: z.string().min(3, 'Zipcode is required'),
  street: z.string().min(3, 'Street is required'),
  
  // Academics (array)
  academics: z.array(z.object({
    degree_level: z.enum(['Intermediate', 'Bachelors', 'Masters']),
    degree_title: z.string().min(2, 'Degree title is required'),
    institution: z.string().min(2, 'Institution is required'),
    passed_year: z.string().min(4, 'Passed year is required'),
    course_start_date: z.string().min(1, 'Start date is required'),
    course_end_date: z.string().min(1, 'End date is required'),
    obtained_mark: z.string().min(1, 'Obtained mark is required'),
  })).min(1, 'At least one academic record is required'),
  
  // Test Score
  test_type: z.enum(['IELTS', 'PTE', 'TOEFL']),
  overall_score: z.string().min(1, 'Overall score is required'),
  reading_score: z.string().min(1, 'Reading score is required'),
  listening_score: z.string().min(1, 'Listening score is required'),
  writing_score: z.string().min(1, 'Writing score is required'),
  speaking_score: z.string().min(1, 'Speaking score is required'),
  attended_date: z.string().min(1, 'Attended date is required'),
});

type ApplicantForm = z.infer<typeof applicantSchema>;

const steps = [
  { id: 1, name: 'Personal Info', description: 'Basic information' },
  { id: 2, name: 'Address', description: 'Location details' },
  { id: 3, name: 'Academics', description: 'Educational background' },
  { id: 4, name: 'Test Scores', description: 'Language proficiency' },
  { id: 5, name: 'Documents', description: 'Upload files' },
];

export default function AddApplicantPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, control, setValue, watch, trigger } = useForm<ApplicantForm>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      academics: [
        {
          degree_level: 'Bachelors',
          degree_title: '',
          institution: '',
          passed_year: '',
          course_start_date: '',
          course_end_date: '',
          obtained_mark: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'academics',
  });

  const validateStep = async (step: number) => {
    const fieldsToValidate: (keyof ApplicantForm)[] = [];
    
    if (step === 1) {
      fieldsToValidate.push('full_name', 'email', 'phone_number', 'interested_course');
    } else if (step === 2) {
      fieldsToValidate.push('country', 'city', 'state', 'zipcode', 'street');
    } else if (step === 3) {
      fieldsToValidate.push('academics');
    } else if (step === 4) {
      fieldsToValidate.push('test_type', 'overall_score', 'reading_score', 'listening_score', 'writing_score', 'speaking_score', 'attended_date');
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ApplicantForm) => {
    if (currentStep < 5) {
      nextStep();
      return;
    }

    if (!document) {
      toast.error('Please upload a document');
      return;
    }

    if (document.size > 10 * 1024 * 1024) {
      toast.error('Document size must be less than 10MB');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'academics') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      // Append document
      formData.append('document', document);

      await applicantAPI.create(formData);
      toast.success('Applicant added successfully!');
      router.push('/dashboard/applicants');
    } catch (error: any) {
      const emailError = error.response.data.email[0];
      const message = emailError || error.response?.data?.message || 'Failed to add applicant. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
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
      setDocument(file);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Applicant</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the applicant details step by step
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id === currentStep
                  ? 'text-primary font-semibold'
                  : step.id < currentStep
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }`}
            >
              <div className="mb-2">Step {step.id}</div>
              <div className="text-xs">{step.name}</div>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    placeholder="Dhukre Don"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="dhukredon@gmail.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number (Nepal +977) *</Label>
                  <Input
                    id="phone_number"
                    {...register('phone_number')}
                    placeholder="+977-9812345678"
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-destructive">{errors.phone_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interested_course">Interested Course *</Label>
                  <Select onValueChange={(value) => setValue('interested_course', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelors">Bachelors</SelectItem>
                      <SelectItem value="Masters">Masters</SelectItem>
                      <SelectItem value="Phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.interested_course && (
                    <p className="text-sm text-destructive">{errors.interested_course.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    {...register('country')}
                    placeholder="Nepal"
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="Kathmandu"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      {...register('state')}
                      placeholder="Bagmati"
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">Zipcode *</Label>
                  <Input
                    id="zipcode"
                    {...register('zipcode')}
                    placeholder="44600"
                  />
                  {errors.zipcode && (
                    <p className="text-sm text-destructive">{errors.zipcode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    {...register('street')}
                    placeholder="Devkota Marg"
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive">{errors.street.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Academics */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-2">
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
                          onValueChange={(value) =>
                            setValue(`academics.${index}.degree_level`, value as any)
                          }
                          defaultValue={field.degree_level}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Bachelors">Bachelors</SelectItem>
                            <SelectItem value="Masters">Masters</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.academics?.[index]?.degree_level && (
                          <p className="text-sm text-destructive">
                            {errors.academics[index]?.degree_level?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Degree Title *</Label>
                        <Input
                          {...register(`academics.${index}.degree_title`)}
                          placeholder="Bachelor of Computer Science"
                        />
                        {errors.academics?.[index]?.degree_title && (
                          <p className="text-sm text-destructive">
                            {errors.academics[index]?.degree_title?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Institution *</Label>
                        <Input
                          {...register(`academics.${index}.institution`)}
                          placeholder="Tribhuvan University"
                        />
                        {errors.academics?.[index]?.institution && (
                          <p className="text-sm text-destructive">
                            {errors.academics[index]?.institution?.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Passed Year *</Label>
                          <Input
                            {...register(`academics.${index}.passed_year`)}
                            placeholder="2023"
                          />
                          {errors.academics?.[index]?.passed_year && (
                            <p className="text-sm text-destructive">
                              {errors.academics[index]?.passed_year?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Obtained Mark (%) *</Label>
                          <Input
                            {...register(`academics.${index}.obtained_mark`)}
                            placeholder="85"
                          />
                          {errors.academics?.[index]?.obtained_mark && (
                            <p className="text-sm text-destructive">
                              {errors.academics[index]?.obtained_mark?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Course Start Date *</Label>
                          <Input
                            type="date"
                            {...register(`academics.${index}.course_start_date`)}
                          />
                          {errors.academics?.[index]?.course_start_date && (
                            <p className="text-sm text-destructive">
                              {errors.academics[index]?.course_start_date?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Course End Date *</Label>
                          <Input
                            type="date"
                            {...register(`academics.${index}.course_end_date`)}
                          />
                          {errors.academics?.[index]?.course_end_date && (
                            <p className="text-sm text-destructive">
                              {errors.academics[index]?.course_end_date?.message}
                            </p>
                          )}
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
            )}

            {/* Step 4: Test Scores */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Type *</Label>
                  <Select onValueChange={(value) => setValue('test_type', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IELTS">IELTS</SelectItem>
                      <SelectItem value="PTE">PTE</SelectItem>
                      <SelectItem value="TOEFL">TOEFL</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.test_type && (
                    <p className="text-sm text-destructive">{errors.test_type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overall_score">Overall Score *</Label>
                  <Input
                    id="overall_score"
                    {...register('overall_score')}
                    placeholder="7.5"
                  />
                  {errors.overall_score && (
                    <p className="text-sm text-destructive">{errors.overall_score.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reading_score">Reading Score *</Label>
                    <Input
                      id="reading_score"
                      {...register('reading_score')}
                      placeholder="8.0"
                    />
                    {errors.reading_score && (
                      <p className="text-sm text-destructive">{errors.reading_score.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="listening_score">Listening Score *</Label>
                    <Input
                      id="listening_score"
                      {...register('listening_score')}
                      placeholder="7.5"
                    />
                    {errors.listening_score && (
                      <p className="text-sm text-destructive">{errors.listening_score.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="writing_score">Writing Score *</Label>
                    <Input
                      id="writing_score"
                      {...register('writing_score')}
                      placeholder="7.0"
                    />
                    {errors.writing_score && (
                      <p className="text-sm text-destructive">{errors.writing_score.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speaking_score">Speaking Score *</Label>
                    <Input
                      id="speaking_score"
                      {...register('speaking_score')}
                      placeholder="7.5"
                    />
                    {errors.speaking_score && (
                      <p className="text-sm text-destructive">{errors.speaking_score.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attended_date">Test Attended Date *</Label>
                  <Input
                    type="date"
                    id="attended_date"
                    {...register('attended_date')}
                  />
                  {errors.attended_date && (
                    <p className="text-sm text-destructive">{errors.attended_date.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Merged Document (PDF, Max 10MB) *</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      id="document"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="document"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {document ? document.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF files only (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                  {document && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{document.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDocument(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}