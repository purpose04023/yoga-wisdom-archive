import { useEffect, useState } from 'react';
import { Book, fetchAllBooks, fetchFeaturedBooks } from '@/lib/supabase-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BooksDisplay() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      const data = filter === 'featured' ? await fetchFeaturedBooks() : await fetchAllBooks();
      setBooks(data);
      setLoading(false);
    };

    loadBooks();
  }, [filter]);

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Books
        </Button>
        <Button
          variant={filter === 'featured' ? 'default' : 'outline'}
          onClick={() => setFilter('featured')}
        >
          Featured
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle className="line-clamp-2">{book.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {book.cover_url && (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-40 object-cover rounded"
                />
              )}
              {book.author && <p className="text-sm text-gray-600">By {book.author}</p>}
              {book.description && (
                <p className="text-sm line-clamp-3">{book.description}</p>
              )}
              {book.topics && (
                <p className="text-xs text-blue-600">Topic: {book.topics.name}</p>
              )}
              {book.pdf_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(book.pdf_url, '_blank')}
                >
                  Read PDF
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No books found
        </div>
      )}
    </div>
  );
}
