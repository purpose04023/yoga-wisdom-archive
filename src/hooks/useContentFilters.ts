import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopics = () =>
  useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("topics").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

export const useLanguages = () =>
  useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("languages").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

export const useContentFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const { data: topics = [] } = useTopics();
  const { data: languages = [] } = useLanguages();

  return {
    searchQuery, setSearchQuery,
    selectedTopic, setSelectedTopic,
    selectedLanguage, setSelectedLanguage,
    topics, languages,
  };
};
