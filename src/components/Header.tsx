import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sparkles, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setFullName(data?.full_name || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/signup');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const landingNavItems = [
    { path: '#how-it-works', label: 'Home', scroll: true },
    { path: '#features', label: 'Features', scroll: true },
    { path: '#pricing', label: 'Pricing', scroll: true },
    { path: '#contact', label: 'Contact Us', scroll: true },
  ];

  const appNavItems = [
    { path: '/dashboard', label: 'Skill Gap' },
    { path: '/resume-optimizer', label: 'Resume Optimizer' },
  ];

  const isLandingPage = location.pathname === '/';
  const navItems = isLandingPage ? landingNavItems : appNavItems;

  const handleNavClick = (path: string, scroll?: boolean) => {
    if (scroll) {
      const element = document.querySelector(path);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Sparkles className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-semibold">Next Hire</h1>
          </div>

          {/* Right Side - Navigation & Actions */}
          <div className="flex items-center gap-6">
            {isLandingPage ? (
              <>
                {/* Landing Page Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                  {landingNavItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavClick(item.path, item.scroll)}
                      className="text-foreground hover:text-primary"
                    >
                      {item.label}
                    </Button>
                  ))}
                </nav>

                {/* Get Started Button */}
                <Button
                  onClick={() => navigate('/signup')}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                {/* App Navigation */}
                <nav className="flex items-center gap-2">
                  {appNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => !isActive && navigate(item.path)}
                        disabled={isActive}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>

                {/* User Profile */}
                {user && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground hidden sm:inline">
                      {fullName}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                          <Avatar className="h-10 w-10 cursor-pointer">
                            <AvatarImage src="" alt={fullName} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {fullName ? getInitials(fullName) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
