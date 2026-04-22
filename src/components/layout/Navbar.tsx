import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Books", path: "/books" },
  { label: "Old Books", path: "/old-books" },
  { label: "Videos", path: "/videos" },
  { label: "Journals", path: "/journals" },
  { label: "Translations", path: "/translations" },
  { label: "Podcasts", path: "/podcasts" },
  { label: "About Guruji", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-serif text-xl font-bold tracking-wide flex items-center gap-2">
            <span className="text-gradient-gold text-2xl">ॐ</span>
            <span className="text-foreground">Advaitha Yogam</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {searchOpen && (
              <Input
                placeholder="Search..."
                className="w-48 h-9 text-sm animate-fade-in"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            )}
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} className="hidden lg:flex">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <nav className="lg:hidden pb-4 animate-fade-in">
            <div className="mb-3">
              <Input placeholder="Search..." className="h-9 text-sm" />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
