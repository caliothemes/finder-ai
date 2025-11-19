import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, FileText, Mail, Image, 
  BarChart3, Users, Sparkles, Shield 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLogo from '@/components/admin/AdminLogo';
import AdminServices from '@/components/admin/AdminServices';
import AdminNewsletter from '@/components/admin/AdminNewsletter';
import AdminStats from '@/components/admin/AdminStats';
import AdminCategories from '@/components/admin/AdminCategories';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">Administration</h1>
          </div>
          <p className="text-slate-600">Gérez Finder AI - Tableau de bord administrateur</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-4">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Services IA
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Catégories
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Logo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="services">
            <AdminServices />
          </TabsContent>

          <TabsContent value="newsletter">
            <AdminNewsletter />
          </TabsContent>

          <TabsContent value="logo">
            <AdminLogo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}