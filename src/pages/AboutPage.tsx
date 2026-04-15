import Layout from "@/components/layout/Layout";

const AboutPage = () => (
  <Layout>
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">Our Teacher</p>
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">About Guruji</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-1">
          <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center text-6xl">🙏</div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            This section will contain the biography and teachings of Guruji. The content will be provided by the site owner and will include details about their spiritual journey, philosophy, and contributions to yoga.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Please provide the details about Guruji — their biography, photos, and key milestones — and this page will be updated with the real content.
          </p>
        </div>
      </div>

      {/* Timeline placeholder */}
      <section>
        <h2 className="font-serif text-2xl font-bold mb-6">Milestones & Journey</h2>
        <div className="space-y-6 border-l-2 border-primary/20 pl-6">
          {[
            { year: "—", title: "Birth & Early Life", desc: "Details to be provided." },
            { year: "—", title: "Spiritual Awakening", desc: "Details to be provided." },
            { year: "—", title: "Founding of Teachings", desc: "Details to be provided." },
            { year: "—", title: "Legacy & Impact", desc: "Details to be provided." },
          ].map((m, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.85rem] top-1 w-3 h-3 rounded-full bg-primary" />
              <p className="text-xs font-semibold text-primary">{m.year}</p>
              <h3 className="font-serif font-semibold text-lg">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Photo gallery placeholder */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold mb-6">Photo Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-2xl text-muted-foreground">📷</div>
          ))}
        </div>
      </section>
    </div>
  </Layout>
);

export default AboutPage;
