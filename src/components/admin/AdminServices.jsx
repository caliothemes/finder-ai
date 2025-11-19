import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AdminServices() {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['adminServices'],
    queryFn: () => base44.entities.AIService.list('-created_date', 50),
  });

  const pendingServices = services.filter(s => s.status === 'pending');
  const approvedServices = services.filter(s => s.status === 'approved');
  const rejectedServices = services.filter(s => s.status === 'rejected');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">{pendingServices.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{approvedServices.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Rejetés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold">{rejectedServices.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services IA soumis</CardTitle>
          <CardDescription>Gérez les soumissions de services IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {service.logo_url && (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-600">{service.tagline}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Soumis par: {service.submitted_by || 'N/A'}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    service.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : service.status === 'pending'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}