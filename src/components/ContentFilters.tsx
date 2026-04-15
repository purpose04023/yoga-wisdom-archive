import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Topic { id: string; name: string; }
interface Language { id: string; name: string; }

interface ContentFiltersProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  topics: Topic[];
  selectedTopic: string;
  onTopicChange: (v: string) => void;
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (v: string) => void;
}

const ContentFilters = ({
  searchQuery, onSearchChange, topics, selectedTopic, onTopicChange, languages, selectedLanguage, onLanguageChange,
}: ContentFiltersProps) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-8">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
    </div>
    <Select value={selectedTopic} onValueChange={onTopicChange}>
      <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Topics" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Topics</SelectItem>
        {topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
      </SelectContent>
    </Select>
    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Languages" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Languages</SelectItem>
        {languages.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

export default ContentFilters;
