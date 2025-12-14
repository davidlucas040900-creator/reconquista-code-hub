// src/pages/admin/AdminNotificacoes.tsx

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useAdminStudents } from '@/hooks/useAdminStudents';
import { useCourses } from '@/hooks/useCourses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Users, User, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function AdminNotificacoes() {
  const { sendNotification } = useAdminNotifications();
  const { students } = useAdminStudents();
  const { data: courses } = useCourses();

  const [recipientType, setRecipientType] = useState<'single' | 'all' | 'course'>('all');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!title || !body) return;

    const recipientId = recipientType === 'single' ? selectedUserId : 
                       recipientType === 'course' ? selectedCourseId : 
                       undefined;

    sendNotification({ recipientType, recipientId, title, body });

    // Reset
    setTitle('');
    setBody('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Enviar Notificações</h1>
          <p className="text-gray-400 mt-1">
            Envie notificações push para seus alunos
          </p>
        </div>

        <Tabs value={recipientType} onValueChange={(v) => setRecipientType(v as any)}>
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-700">
              <Users className="w-4 h-4 mr-2" />
              Todos os Alunos
            </TabsTrigger>
            <TabsTrigger value="single" className="data-[state=active]:bg-zinc-700">
              <User className="w-4 h-4 mr-2" />
              Aluno Específico
            </TabsTrigger>
            <TabsTrigger value="course" className="data-[state=active]:bg-zinc-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Alunos de um Curso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="space-y-4">
                <div>
                  <Label>Título da Notificação</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Nova aula disponível!"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                    rows={4}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button onClick={handleSend} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Todos ({students?.length || 0} alunos)
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="single" className="space-y-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="space-y-4">
                <div>
                  <Label>Selecionar Aluno</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Escolha um aluno" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {students?.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name || student.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título da Notificação</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Mensagem especial para você"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                    rows={4}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button onClick={handleSend} className="w-full" disabled={!selectedUserId}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="course" className="space-y-4 mt-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="space-y-4">
                <div>
                  <Label>Selecionar Curso</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Escolha um curso" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título da Notificação</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Novidade no curso!"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                    rows={4}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button onClick={handleSend} className="w-full" disabled={!selectedCourseId}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Alunos do Curso
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
