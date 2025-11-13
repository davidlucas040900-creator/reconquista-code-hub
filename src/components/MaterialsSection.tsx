import { FileText, Headphones, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Material {
  type: 'pdf' | 'audio';
  title: string;
  description: string;
  url?: string;
}

const materials: Material[] = [
  {
    type: 'pdf',
    title: 'Resumo da Aula',
    description: 'Pontos-chave e exercícios práticos',
  },
  {
    type: 'pdf',
    title: 'Checklist de Aplicação',
    description: 'Passo a passo para aplicar o que aprendeu',
  },
  {
    type: 'audio',
    title: 'Versão em Áudio (Podcast)',
    description: 'Ouça enquanto faz outras atividades',
  },
];

export const MaterialsSection = () => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-foreground mb-4">
        📚 Materiais de Apoio
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material, index) => (
          <Card key={index} className="p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                {material.type === 'pdf' ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : (
                  <Headphones className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {material.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {material.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={!material.url}
                >
                  <Download className="w-4 h-4" />
                  {material.url ? 'Baixar' : 'Em breve'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
