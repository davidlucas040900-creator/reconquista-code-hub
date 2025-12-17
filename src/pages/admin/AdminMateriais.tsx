// src/pages/admin/AdminMateriais.tsx

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminMaterials } from '@/hooks/useAdminMaterials';
import { useCourses } from '@/hooks/useCourses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Trash2, Image as ImageIcon, Music, Video } from 'lucide-react';
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

export default function AdminMateriais() {
  const { materials, isLoading, uploadMaterial, deleteMaterial } = useAdminMaterials();
  const { data: courses } = useCourses();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !title) return;

    uploadMaterial({
      file: selectedFile,
      title,
      description,
      courseId: selectedCourse || undefined,
      moduleId: selectedModule || undefined,
    });

    // Reset
    setShowUploadDialog(false);
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setSelectedCourse('');
    setSelectedModule('');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <ImageIcon className="w-5 h-5" />;
    if (fileType.includes('audio')) return <Music className="w-5 h-5" />;
    if (fileType.includes('video')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Carregando materiais...</div>
        </div>
      </AdminLayout>
    );
  }

  const selectedCourseData = courses?.find((c) => c.id === selectedCourse);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Materiais</h1>
            <p className="text-gray-400 mt-1">
              Gerencie PDFs, audios, imagens e videos
            </p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Material
          </Button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials?.map((material) => (
            <Card key={material.id} className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-800 rounded-lg text-gold">
                    {getFileIcon(material.file_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{material.title}</h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(material.file_size || 0)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMaterial(material.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {material.description && (
                <p className="text-sm text-gray-400 mb-3">{material.description}</p>
              )}

              {material.course && (
                <div className="text-xs text-gray-500">
                  <span className="text-gold">Curso:</span> {material.course.name}
                </div>
              )}
              {material.module && (
                <div className="text-xs text-gray-500">
                  <span className="text-gold">Modulo:</span> {material.module.name}
                </div>
              )}

              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4"
              >
                <Button variant="outline" size="sm" className="w-full border-zinc-700">
                  Abrir Arquivo
                </Button>
              </a>
            </Card>
          ))}
        </div>

        {materials?.length === 0 && (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum material enviado
            </h3>
            <p className="text-gray-400 mb-4">
              Comece fazendo upload de PDFs, audios ou imagens
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Primeiro Material
            </Button>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload de Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arquivo</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.mp3,.mp4,.wav"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-2">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div>
              <Label>Titulo *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do material"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label>Descricao</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descricao opcional..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label>Curso (opcional)</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um curso" />
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

            {selectedCourse && selectedCourseData?.course_modules && (
              <div>
                <Label>Modulo (opcional)</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione um modulo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {selectedCourseData.course_modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || !title}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
