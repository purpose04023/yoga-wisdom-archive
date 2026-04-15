import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*, topics(name), languages(name)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Layout><div className="container mx-auto px-4 py-12"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div></Layout>;
  if (!book) return <Layout><div className="container mx-auto px-4 py-12 text-center"><p>Book not found.</p></div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Link to={book.book_type === "old" ? "/old-books" : "/books"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to {book.book_type === "old" ? "Old Books" : "Books"}
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full rounded-lg shadow-lg" />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center text-6xl">📖</div>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {(book.topics as any)?.name && <Badge variant="secondary">{(book.topics as any).name}</Badge>}
              {(book.languages as any)?.name && <Badge variant="outline">{(book.languages as any).name}</Badge>}
              {book.book_type === "old" && <Badge className="bg-gold text-primary-foreground">Historical</Badge>}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
            {book.author && <p className="text-lg text-muted-foreground mb-4">by {book.author}</p>}
            {book.description && <p className="text-muted-foreground leading-relaxed mb-6">{book.description}</p>}
            {book.pdf_url && (
              <div className="space-y-4">
                <Button asChild><a href={book.pdf_url} target="_blank" rel="noopener"><Download className="h-4 w-4 mr-2" /> Download PDF</a></Button>
                <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
                  <iframe src={book.pdf_url} className="w-full h-full" title={book.title} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetailPage;
