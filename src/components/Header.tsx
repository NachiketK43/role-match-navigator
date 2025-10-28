import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/analysis', label: 'Analysis' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-semibold">SkillLens</h1>
          </div>

          {/* Centered Navigation */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => !isActive && navigate(item.path)}
                  disabled={isActive}
                  className={cn(
                    'transition-all',
                    isActive && 'cursor-default'
                  )}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
