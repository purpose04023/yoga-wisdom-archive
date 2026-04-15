import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card mt-16">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-serif text-lg font-bold text-primary mb-3">Yoga Wisdom Portal</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A spiritual knowledge archive preserving ancient yoga wisdom through books, translations, and teachings.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Library</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/books" className="hover:text-primary transition-colors">Books</Link>
            <Link to="/old-books" className="hover:text-primary transition-colors">Old Books Archive</Link>
            <Link to="/translations" className="hover:text-primary transition-colors">Translations</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Media</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/videos" className="hover:text-primary transition-colors">Videos</Link>
            <Link to="/podcasts" className="hover:text-primary transition-colors">Podcasts</Link>
            <Link to="/journals" className="hover:text-primary transition-colors">Journals</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Connect</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">About Guruji</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Yoga Wisdom Portal. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
