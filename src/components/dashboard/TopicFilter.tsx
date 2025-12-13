// src/components/dashboard/TopicFilter.tsx

import { Topic } from '@/types';

interface TopicFilterProps {
  topics: Topic[];
  activeTopic: string;
  onTopicChange: (topicId: string) => void;
}

export function TopicFilter({ topics, activeTopic, onTopicChange }: TopicFilterProps) {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="scroll-container">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicChange(topic.id)}
              className={`scroll-item topic-chip ${
                activeTopic === topic.id ? 'topic-chip-active' : ''
              }`}
            >
              <span>{topic.icon}</span>
              <span>{topic.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
