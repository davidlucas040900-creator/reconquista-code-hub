// src/components/dashboard/TopicFilter.tsx

import { Topic } from '@/types';

interface TopicFilterProps {
  topics: Topic[];
  activeTopic: string;
  onTopicChange: (topicId: string) => void;
  label?: string;
}

export function TopicFilter({ topics, activeTopic, onTopicChange, label }: TopicFilterProps) {
  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Label opcional */}
        {label && (
          <p className="text-xs text-silk-400 uppercase tracking-wider mb-3">
            {label}
          </p>
        )}
        
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
