// src/components/dashboard/TopicFilter.tsx

interface Topic {
  id: string;
  name: string;
  icon: string;
}

interface TopicFilterProps {
  topics: Topic[];
  activeTopic: string;
  onTopicChange: (topicId: string) => void;
}

export function TopicFilter({ topics, activeTopic, onTopicChange }: TopicFilterProps) {
  return (
    <section className="px-4 py-4 md:px-8 md:py-6">
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onTopicChange(topic.id)}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap transition-all duration-300 text-xs md:text-sm ${
              activeTopic === topic.id
                ? 'bg-gold/20 border border-gold/50 text-gold'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{topic.icon}</span>
            <span>{topic.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
