import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';

export default function AdminLegalSections() {
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', order: 0, active: true });
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['adminLegalSections'],
    queryFn: async () => {
      const data = await base44.entities.LegalSection.list();
      return data.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LegalSection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLegalSections'] });
      setFormData({ title: '', content: '', order: sections.length, active: true });
      toast.success('Section créée');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LegalSection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLegalSections'] });
      setEditingSection(null);
      setFormData({ title: '', content: '', order: 0, active: true });
      toast.success('Section mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LegalSection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLegalSections'] });
      toast.success('Section supprimée');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, order: sections.length });
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      content: section.content,
      order: section.order || 0,
      active: section.active !== false,
    });
  };

  const toggleActive = (section) => {
    updateMutation.mutate({
      id: section.id,
      data: { active: !section.active },
    });
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingSection ? 'Modifier la section' : 'Nouvelle section'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Titre
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Éditeur du site"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Contenu
              </label>
              <ReactQuill
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                className="bg-white"
                theme="snow"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <span className="text-sm text-slate-600">Section active</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Ordre:</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingSection ? 'Mettre à jour' : 'Créer'}
              </Button>
              {editingSection && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSection(null);
                    setFormData({ title: '', content: '', order: sections.length, active: true });
                  }}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Sections existantes ({sections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : sections.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              Aucune section créée
            </p>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    section.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">{section.title}</div>
                      <div className="text-sm text-slate-500">Ordre: {section.order || 0}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleActive(section)}
                      title={section.active ? 'Désactiver' : 'Activer'}
                    >
                      {section.active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(section)}
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(section.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}