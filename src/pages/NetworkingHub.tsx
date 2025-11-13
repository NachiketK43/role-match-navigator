import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Users } from 'lucide-react';
import { useContacts, Contact } from '@/hooks/useContacts';
import { NetworkingStats } from '@/components/networking/NetworkingStats';
import { ContactCard } from '@/components/networking/ContactCard';
import { ContactDialog } from '@/components/networking/ContactDialog';
import { ContactDetailsSheet } from '@/components/networking/ContactDetailsSheet';

export default function NetworkingHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const { data: contacts = [], isLoading } = useContacts();

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = 
        searchQuery === '' ||
        contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || contact.contact_type === typeFilter;
      
      return matchesSearch && matchesType && contact.is_active;
    });
  }, [contacts, searchQuery, typeFilter]);

  const openDetailsSheet = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailsOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
    setIsDetailsOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingContact(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Compact Header with Stats Inline */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
                  Networking Hub
                </h1>
                <p className="text-sm text-muted-foreground">
                  Build meaningful connections and track your professional relationships
                </p>
              </div>
              <Button 
                size="default"
                onClick={() => {
                  setEditingContact(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>

            {/* Horizontal Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <div className="p-2 rounded-md bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contacts.filter(c => c.is_active).length}</p>
                  <p className="text-xs text-muted-foreground">Total Contacts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <div className="p-2 rounded-md bg-success/10">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.is_active && c.relationship_strength === 'strong').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Strong Connections</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <div className="p-2 rounded-md bg-warning/10">
                  <Users className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.is_active && c.next_followup_date && new Date(c.next_followup_date) < new Date()).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Follow-ups</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <div className="p-2 rounded-md bg-info/10">
                  <Users className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.is_active && c.last_contacted_date && 
                      (Date.now() - new Date(c.last_contacted_date).getTime()) < 30 * 24 * 60 * 60 * 1000).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active (30d)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center bg-card p-4 rounded-lg border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, company, or role..."
                className="pl-10 border-0 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="lg:w-auto">
              <TabsList className="grid grid-cols-6">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="recruiter" className="text-xs">Recruiters</TabsTrigger>
                <TabsTrigger value="employee" className="text-xs">Employees</TabsTrigger>
                <TabsTrigger value="mentor" className="text-xs">Mentors</TabsTrigger>
                <TabsTrigger value="referral" className="text-xs">Referrals</TabsTrigger>
                <TabsTrigger value="connection" className="text-xs">Connections</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Contacts Section */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {contacts.length === 0 ? 'No contacts yet' : 'No matching contacts'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                {contacts.length === 0 
                  ? 'Start building your professional network by adding your first contact'
                  : 'Try adjusting your search or filters to find contacts'
                }
              </p>
              {contacts.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredContacts.map(contact => (
                <ContactCard 
                  key={contact.id} 
                  contact={contact}
                  onClick={() => openDetailsSheet(contact)}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      <ContactDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose}
        contact={editingContact}
      />
      <ContactDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        contact={selectedContact}
        onEdit={handleEdit}
      />
    </div>
  );
}
