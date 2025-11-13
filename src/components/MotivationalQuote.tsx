import { Sparkles } from 'lucide-react';

const quotes = [
  "Você merece ser a prioridade, não a opção. 👑",
  "Ele vai voltar. Mas primeiro, você volta para você mesma. ✨",
  "Confiança é o poder secreto que nenhum homem resiste. 💪",
  "A ausência estratégica é a presença mais poderosa. 🔥",
  "Não é sobre esperar por ele. É sobre se tornar irresistível. 💋",
  "Quanto mais você se valoriza, mais ele te valoriza. 💎",
  "O segredo não é ser perfeita, é ser inesquecível. ⭐",
  "Ele não te esqueceu. Ele está lutando contra a vontade de voltar. 💭",
];

export const MotivationalQuote = () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-lg p-6 mb-8 border border-primary/30">
      <div className="flex items-start gap-3">
        <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <p className="text-lg font-medium text-foreground italic">
          {randomQuote}
        </p>
      </div>
    </div>
  );
};
