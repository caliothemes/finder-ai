import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBackup() {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('exportBackup');
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Créer un fichier JSON à télécharger
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `finder-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackup({
        date: new Date(),
        entries: data.totalEntries,
        entities: Object.keys(data.data).length
      });

      toast.success(`✅ Sauvegarde créée: ${data.totalEntries} entrées`);
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Sauvegarde complète de la base de données</CardTitle>
              <CardDescription>
                Exportez toutes les données du site en un fichier JSON
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Données incluses dans la sauvegarde
            </h3>
            <div className="grid md:grid-cols-3 gap-2 text-sm text-slate-600">
              <div>• Utilisateurs</div>
              <div>• Services IA</div>
              <div>• Catégories</div>
              <div>• Bannières & Réservations</div>
              <div>• Comptes Pro</div>
              <div>• Stories</div>
              <div>• Avis utilisateurs</div>
              <div>• Avis Finder AI</div>
              <div>• Favoris</div>
              <div>• Actualités IA</div>
              <div>• Découvertes IA</div>
              <div>• Newsletter</div>
              <div>• Templates emails</div>
              <div>• Sections légales</div>
              <div>• Générations IA</div>
              <div>• Vues pages</div>
              <div>• Revendications propriété</div>
              <div>• Configuration Autopilot</div>
              <div>• Avis actualités</div>
              <div>• Chats GPT</div>
              <div>• Clics services</div>
              <div>• Vidéos actualités IA</div>
              <div>• Chaînes YouTube</div>
            </div>
          </div>

          {lastBackup && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900 mb-1">Dernière sauvegarde réussie</p>
                  <p className="text-sm text-green-700">
                    {lastBackup.date.toLocaleString('fr-FR')} • {lastBackup.entries.toLocaleString()} entrées • {lastBackup.entities} entités
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-bold mb-1">Important</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Conservez ce fichier en lieu sûr</li>
                  <li>Le fichier contient toutes les données sensibles (emails, etc.)</li>
                  <li>Créez des sauvegardes régulières (hebdomadaires recommandées)</li>
                  <li>Combinez avec votre sauvegarde GitHub du code</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={loading}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Télécharger la sauvegarde JSON
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            Le téléchargement démarre automatiquement après génération du fichier
          </p>
        </CardContent>
      </Card>
    </div>
  );
}