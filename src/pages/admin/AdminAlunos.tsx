// src/pages/admin/AdminAlunos.tsx
// VERSÃO ACTUALIZADA - Sem senha, com Magic Link

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStudents } from '@/hooks/useAdminStudents';
import { useCourses } from '@/hooks/useCourses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Lock,
  Unlock,
  Link2,
  BookOpen,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Eye,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminAlunos() {
  const { 
    students, 
    isLoading, 
    toggleAccess, 
    generateMagicLinkAsync,
    isGeneratingMagicLink,
    grantCourseAccess, 
    revokeCourseAccess,
    getUserDetails 
  } = useAdminStudents();
  const { data: courses } = useCourses();

  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  
  // Dialogs
  const [showMagicLinkDialog, setShowMagicLinkDialog] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Magic Link
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Curso
  const [selectedCourse, setSelectedCourse] = useState('');

  // Filtrar alunos
  const filteredStudents = students?.filter((s) =>
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.whatsapp?.includes(searchTerm)
  );

  // Gerar Magic Link
  const handleGenerateMagicLink = async () => {
    if (!selectedStudent) return;
    
    try {
      const result = await generateMagicLinkAsync({ 
        userId: selectedStudent.id,
        expiryDays: 7 
      });
      
      if (result.success && result.magic_link) {
        setGeneratedLink(result.magic_link);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Copiar link
  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  // Dar acesso a curso
  const handleGrantCourse = () => {
    if (!selectedStudent || !selectedCourse) return;
    grantCourseAccess({ userId: selectedStudent.id, courseId: selectedCourse });
    setShowCourseDialog(false);
    setSelectedCourse('');
  };

  // Ver detalhes
  const handleViewDetails = async (student: any) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
    
    const details = await getUserDetails(student.id);
    setStudentDetails(details);
  };

  // Fechar dialog magic link
  const closeMagicLinkDialog = () => {
    setShowMagicLinkDialog(false);
    setGeneratedLink(null);
    setLinkCopied(false);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Gerenciar Alunos">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gerenciar Alunos">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400">
              Total: <span className="text-white font-semibold">{students?.length || 0}</span> alunos
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por email, nome ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white">{students?.length || 0}</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-gray-400">Com Acesso</p>
            <p className="text-2xl font-bold text-green-400">
              {students?.filter(s => s.has_full_access).length || 0}
            </p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-gray-400">Bloqueados</p>
            <p className="text-2xl font-bold text-red-400">
              {students?.filter(s => !s.has_full_access).length || 0}
            </p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-gray-400">Com Compras</p>
            <p className="text-2xl font-bold text-amber-400">
              {students?.filter(s => s.total_purchases > 0).length || 0}
            </p>
          </Card>
        </div>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents?.map((student) => (
            <Card key={student.id} className="bg-zinc-900 border-zinc-800 p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {student.full_name || 'Sem nome'}
                    </h3>
                    {student.has_full_access ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ACESSO ATIVO
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        BLOQUEADO
                      </Badge>
                    )}
                    {student.total_purchases > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {student.total_purchases} compra(s)
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </span>
                    {student.whatsapp && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {student.whatsapp}
                      </span>
                    )}
                    {student.courses_count > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {student.courses_count} curso(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  
                  {/* Ver Detalhes */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(student)}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {/* Magic Link */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowMagicLinkDialog(true);
                    }}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Link
                  </Button>
                  
                  {/* Bloquear/Desbloquear */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAccess({ userId: student.id, hasAccess: student.has_full_access })}
                    className={student.has_full_access 
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                    }
                  >
                    {student.has_full_access ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Bloquear
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Liberar
                      </>
                    )}
                  </Button>

                  {/* Cursos */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowCourseDialog(true);
                    }}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Cursos
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredStudents?.length === 0 && (
            <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum aluno encontrado</p>
            </Card>
          )}
        </div>
      </div>

      {/* ========================================
          DIALOG: GERAR MAGIC LINK
          ======================================== */}
      <Dialog open={showMagicLinkDialog} onOpenChange={closeMagicLinkDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-amber-500" />
              Gerar Link de Acesso
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedStudent?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!generatedLink ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">
                  Gere um link mágico para o aluno acessar a plataforma sem precisar de senha.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  O link expira em <span className="text-amber-400">7 dias</span>
                </p>
                <Button 
                  onClick={handleGenerateMagicLink}
                  disabled={isGeneratingMagicLink}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {isGeneratingMagicLink ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Gerar Magic Link
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium mb-2">
                    ✅ Link gerado com sucesso!
                  </p>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={generatedLink} 
                      readOnly 
                      className="bg-zinc-800 border-zinc-700 text-white text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleCopyLink}
                      className={linkCopied ? "bg-green-500" : "bg-amber-500 hover:bg-amber-600"}
                    >
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700"
                    onClick={() => window.open(generatedLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Testar Link
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700"
                    onClick={() => {
                      const text = `Olá! Aqui está seu link de acesso:\n\n${generatedLink}\n\nEste link expira em 7 dias.`;
                      const whatsapp = selectedStudent?.whatsapp?.replace(/\D/g, '');
                      if (whatsapp) {
                        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
                      } else {
                        navigator.clipboard.writeText(text);
                        toast.success('Mensagem copiada!');
                      }
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Enviar WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeMagicLinkDialog} className="border-zinc-700">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================
          DIALOG: GERENCIAR CURSOS
          ======================================== */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Acesso a Cursos</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedStudent?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCourseDialog(false)} className="border-zinc-700">
              Cancelar
            </Button>
            <Button 
              onClick={handleGrantCourse}
              disabled={!selectedCourse}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Dar Acesso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================
          DIALOG: DETALHES DO UTILIZADOR
          ======================================== */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Detalhes do Aluno
            </DialogTitle>
          </DialogHeader>
          
          {studentDetails ? (
            <div className="space-y-6 py-4">
              
              {/* Perfil */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Perfil</h4>
                <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                  <p><span className="text-gray-400">Nome:</span> {studentDetails.profile?.full_name || 'N/A'}</p>
                  <p><span className="text-gray-400">Email:</span> {studentDetails.profile?.email}</p>
                  <p><span className="text-gray-400">WhatsApp:</span> {studentDetails.profile?.whatsapp || 'N/A'}</p>
                  <p><span className="text-gray-400">Acesso:</span> {studentDetails.profile?.has_full_access ? '✅ Ativo' : '❌ Bloqueado'}</p>
                  <p><span className="text-gray-400">Data de Compra:</span> {studentDetails.profile?.purchase_date ? new Date(studentDetails.profile.purchase_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
              </div>
              
              {/* Compras */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">
                  Compras ({studentDetails.purchases?.length || 0})
                </h4>
                {studentDetails.purchases?.length > 0 ? (
                  <div className="space-y-2">
                    {studentDetails.purchases.map((purchase: any) => (
                      <div key={purchase.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm">{purchase.product_name || purchase.lojou_product_name}</p>
                          <p className="text-xs text-gray-400">{new Date(purchase.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">
                          {purchase.amount} MZN
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma compra registrada</p>
                )}
              </div>
              
              {/* Cursos */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">
                  Acesso a Cursos ({studentDetails.course_access?.length || 0})
                </h4>
                {studentDetails.course_access?.length > 0 ? (
                  <div className="space-y-2">
                    {studentDetails.course_access.map((access: any) => (
                      <div key={access.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm">{access.course_name}</p>
                          <p className="text-xs text-gray-400">Liberado em {new Date(access.granted_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={access.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                            {access.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeCourseAccess({ userId: selectedStudent.id, courseId: access.course_id })}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum acesso a cursos</p>
                )}
              </div>
              
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="border-zinc-700">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
