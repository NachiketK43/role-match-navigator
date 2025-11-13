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
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Networking Hub
              </h1>
              <p className="text-lg text-muted-foreground">
                Build relationships that open doors. Track every connection.
              </p>
            </div>
            <Button 
              size="lg" 
              className="shadow-elevated"
              onClick={() => {
                setEditingContact(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Contact
            </Button>
          </div>

          <NetworkingStats contacts={contacts} />

          <Card className="p-6 shadow-card">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search contacts by name, company, or role..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                <TabsList className="grid grid-cols-6 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="recruiter">Recruiters</TabsTrigger>
                  <TabsTrigger value="employee">Employees</TabsTrigger>
                  <TabsTrigger value="mentor">Mentors</TabsTrigger>
                  <TabsTrigger value="referral">Referrals</TabsTrigger>
                  <TabsTrigger value="connection">Connections</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {contacts.length === 0 ? 'No contacts yet' : 'No matching contacts'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {contacts.length === 0 
                  ? 'Start building your professional network'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {contacts.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Contact
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
