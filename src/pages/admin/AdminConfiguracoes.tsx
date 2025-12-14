// src/pages/admin/AdminConfiguracoes.tsx

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminCustomization } from '@/hooks/useAdminCustomization';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Image, Layout, Save } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function AdminConfiguracoes() {
  const { customization, updateCustomization, isLoading } = useAdminCustomization();

  // Hero Section
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Theme Colors
  const [primaryColor, setPrimaryColor] = useState('#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState('#4B0082');
  const [backgroundColor, setBackgroundColor] = useState('#0a0a0a');
  const [cardColor, setCardColor] = useState('#1a1a1a');

  // Dashboard Sections Order
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([]);

  useEffect(() => {
    if (customization) {
      // Hero Section
      const hero = customization.hero_section;
      if (hero) {
        setHeroTitle(hero.title || '');
        setHeroSubtitle(hero.subtitle || '');
        setHeroImage(hero.background_image || '');
      }

      // Theme Colors
      const colors = customization.theme_colors;
      if (colors) {
        setPrimaryColor(colors.primary || '#D4AF37');
        setSecondaryColor(colors.secondary || '#4B0082');
        setBackgroundColor(colors.background || '#0a0a0a');
        setCardColor(colors.card || '#1a1a1a');
      }

      // Sections Order
      const order = customization.dashboard_sections_order;
      if (order?.sections) {
        setSectionsOrder(order.sections);
      }
    }
  }, [customization]);

  const handleSaveHero = () => {
    updateCustomization({
      key: 'hero_section',
      value: {
        title: heroTitle,
        subtitle: heroSubtitle,
        background_image: heroImage,
      },
    });
  };

  const handleSaveColors = () => {
    updateCustomization({
      key: 'theme_colors',
      value: {
        primary: primaryColor,
        secondary: secondaryColor,
        background: backgroundColor,
        card: cardColor,
      },
    });
  };

  const handleSaveSectionsOrder = () => {
    updateCustomization({
      key: 'dashboard_sections_order',
      value: {
        sections: sectionsOrder,
      },
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setSectionsOrder(newOrder);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Carregando configurações...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações da Plataforma</h1>
          <p className="text-gray-400 mt-1">
            Personalize cores, textos e layout do dashboard
          </p>
        </div>

        <Tabs defaultValue="hero">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="hero" className="data-[state=active]:bg-zinc-700">
              <Image className="w-4 h-4 mr-2" />
              Hero Section
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:bg-zinc-700">
              <Palette className="w-4 h-4 mr-2" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="layout" className="data-[state=active]:bg-zinc-700">
              <Layout className="w-4 h-4 mr-2" />
              Layout
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Hero Section do Dashboard</h2>
              <div className="space-y-4">
                <div>
                  <Label>Título Principal</Label>
                  <Input
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Ex: Bem-vinda à sua jornada de transformação"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Input
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Ex: Comece agora e descubra seu poder"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label>URL da Imagem de Fundo</Label>
                  <Input
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                {/* Preview */}
                {heroImage && (
                  <div className="mt-4">
                    <Label>Preview:</Label>
                    <div className="relative h-48 rounded-lg overflow-hidden mt-2">
                      <img
                        src={heroImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center px-6">
                        <h3 className="text-2xl font-bold text-white">{heroTitle}</h3>
                        <p className="text-gray-300 mt-1">{heroSubtitle}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleSaveHero} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Hero Section
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Colors */}
          <TabsContent value="colors" className="space-y-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cores do Tema</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor Primária (Dourado)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-12 p-1 bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor Secundária (Roxo)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-12 p-1 bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor de Fundo</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-20 h-12 p-1 bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor dos Cards</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={cardColor}
                      onChange={(e) => setCardColor(e.target.value)}
                      className="w-20 h-12 p-1 bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={cardColor}
                      onChange={(e) => setCardColor(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveColors} className="w-full mt-6">
                <Save className="w-4 h-4 mr-2" />
                Salvar Cores
              </Button>
            </Card>
          </TabsContent>

          {/* Layout */}
          <TabsContent value="layout" className="space-y-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Ordem das Seções</h2>
              <p className="text-gray-400 text-sm mb-4">
                Arraste para reorganizar as seções do Dashboard
              </p>
              <div className="space-y-2">
                {sectionsOrder.map((section, index) => (
                  <div
                    key={section}
                    className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                  >
                    <span className="text-white capitalize">{section}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className="border-zinc-700"
                      >
                        
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sectionsOrder.length - 1}
                        className="border-zinc-700"
                      >
                        
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveSectionsOrder} className="w-full mt-6">
                <Save className="w-4 h-4 mr-2" />
                Salvar Ordem
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
