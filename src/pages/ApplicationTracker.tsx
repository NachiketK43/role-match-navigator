import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Briefcase } from 'lucide-react';
import { useApplications, useUpdateApplication } from '@/hooks/useApplications';
import { ApplicationStats } from '@/components/application-tracker/ApplicationStats';
import { ApplicationCard } from '@/components/application-tracker/ApplicationCard';
import { ApplicationDialog } from '@/components/application-tracker/ApplicationDialog';
import { ApplicationDetailsSheet } from '@/components/application-tracker/ApplicationDetailsSheet';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['job_applications']['Row'];
type ApplicationStatus = Database['public']['Enums']['application_status'];

export default function ApplicationTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useApplications();
  const updateMutation = useUpdateApplication();

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        searchQuery === '' ||
        app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const openDetailsSheet = (app: Application) => {
    setSelectedApplication(app);
    setIsDetailsOpen(true);
  };

  const handleEdit = (app: Application) => {
    setEditingApplication(app);
    setIsDialogOpen(true);
    setIsDetailsOpen(false);
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    await updateMutation.mutateAsync({ id, updates: { status } });
  };

  const handleDelete = async (id: string) => {
    // Delete is handled in the details sheet
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingApplication(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#343434]">
                Application Tracker
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage and track all your job applications in one place
              </p>
            </div>
            <Button 
              size="lg" 
              className="shadow-elevated"
              onClick={() => {
                setEditingApplication(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Application
            </Button>
          </div>

          {/* Stats Dashboard */}
          <ApplicationStats applications={applications} />

          {/* Search and Filters */}
          <Card className="p-6 shadow-card">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search companies, roles, or notes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}>
                <TabsList className="grid grid-cols-5 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                  <TabsTrigger value="applied">Applied</TabsTrigger>
                  <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
                  <TabsTrigger value="offer">Offers</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>

          {/* Applications Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {applications.length === 0 
                  ? 'Start tracking your job applications to stay organized'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {applications.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Application
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map(app => (
                <ApplicationCard 
                  key={app.id} 
                  application={app}
                  onClick={() => openDetailsSheet(app)}
                  onStatusChange={(status) => handleStatusChange(app.id, status)}
                  onDelete={() => handleDelete(app.id)}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Dialogs and Sheets */}
      <ApplicationDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose}
        application={editingApplication}
      />
      <ApplicationDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        application={selectedApplication}
        onEdit={handleEdit}
      />
    </div>
  );
}
