"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { applicantAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
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

interface Applicant {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  interested_course: string;
  test_type: string;
  overall_score: string;
  created_at: string;
}

export default function ApplicantsPage() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredApplicants(applicants);
    } else {
      const filtered = applicants.filter(
        (applicant) =>
          applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.phone_number.includes(searchQuery)
      );
      setFilteredApplicants(filtered);
    }
  }, [searchQuery, applicants]);

  const fetchApplicants = async () => {
    try {
      // get all applicants
      const response = await applicantAPI.getAll();

      // extract the array from response data (store the results array, not the whole response)
      const list = response.data.results;
      setApplicants(list);
      setFilteredApplicants(list);
    } catch (error) {
      toast.error('Failed to fetch applicants');
      console.error('Failed to fetch applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await applicantAPI.delete(deleteId);
      toast.success('Applicant deleted successfully');
      setApplicants(applicants.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete applicant');
      console.error('Failed to delete applicant:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getCourseColor = (course: string) => {
    switch (course) {
      case 'Bachelors':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Masters':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Phd':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all applicant records
          </p>
        </div>
        <Link href="/dashboard/add-applicant">
          <Button>Add New Applicant</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
          <CardDescription>
            {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Get started by adding your first applicant'}
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/add-applicant">
                    <Button>Add Applicant</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{applicant.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(applicant.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{applicant.email}</p>
                            <p className="text-muted-foreground">{applicant.phone_number}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCourseColor(applicant.interested_course)} variant="secondary">
                            {applicant.interested_course}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{applicant.test_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{applicant.overall_score}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/applicants/${applicant.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                           
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the applicant record
              and all associated data.
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