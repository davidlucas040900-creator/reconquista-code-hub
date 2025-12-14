// src/pages/admin/AdminAlunos.tsx

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStudents } from '@/hooks/useAdminStudents';
import { useCourses } from '@/hooks/useCourses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Lock,
  Unlock,
  Key,
  BookOpen,
  Ban,
  CheckCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminAlunos() {
  const { students, isLoading, toggleAccess, resetPassword, grantCourseAccess, revokeCourseAccess, blockModule, unblockModule } = useAdminStudents();
  const { data: courses } = useCourses();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const filteredStudents = students?.filter((s) =>
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResetPassword = () => {
    if (!selectedStudent || !newPassword) return;
    resetPassword({ userId: selectedStudent.id, newPassword });
    setShowPasswordDialog(false);
    setNewPassword('');
  };

  const handleGrantCourse = () => {
    if (!selectedStudent || !selectedCourse) return;
    grantCourseAccess({ userId: selectedStudent.id, courseId: selectedCourse });
    setShowCourseDialog(false);
    setSelectedCourse('');
  };

  const handleBlockModule = () => {
    if (!selectedStudent || !selectedModule) return;
    blockModule({ userId: selectedStudent.id, moduleId: selectedModule, reason: blockReason });
    setShowModuleDialog(false);
    setSelectedModule('');
    setBlockReason('');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Carregando alunos...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Alunos</h1>
            <p className="text-gray-400 mt-1">
              Total: {students?.length || 0} alunos
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por email ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents?.map((student) => (
            <Card key={student.id} className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {student.full_name || 'Sem nome'}
                    </h3>
                    {student.has_full_access ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        ACESSO TOTAL
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{student.email}</p>
                  {student.whatsapp && (
                    <p className="text-gray-500 text-xs mt-1">
                      WhatsApp: {student.whatsapp}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Bloquear/Desbloquear */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAccess({ userId: student.id, hasAccess: student.has_full_access })}
                    className="border-zinc-700"
                  >
                    {student.has_full_access ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Bloquear
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Desbloquear
                      </>
                    )}
                  </Button>

                  {/* Trocar Senha */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowPasswordDialog(true);
                    }}
                    className="border-zinc-700"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Senha
                  </Button>

                  {/* Gerenciar Cursos */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowCourseDialog(true);
                    }}
                    className="border-zinc-700"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Cursos
                  </Button>

                  {/* Bloquear Módulo */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowModuleDialog(true);
                    }}
                    className="border-zinc-700"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Módulos
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog: Trocar Senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Trocar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nova Senha</Label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword}>Alterar Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Gerenciar Cursos */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Acesso a Cursos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecionar Curso</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGrantCourse}>Dar Acesso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Bloquear Módulo */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Bloquear Módulo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecionar Módulo</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Escolha um módulo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  {courses?.flatMap((c) => c.course_modules || []).map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo (opcional)</Label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Descreva o motivo do bloqueio..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBlockModule}>Bloquear Módulo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
