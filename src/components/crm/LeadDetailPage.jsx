import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../../contexts/LeadContext';
import LeadDetailPanel from '../LeadDetailPanel';
import { Skeleton } from '../ui/Skeleton';
import { toast } from 'sonner';

const LeadDetailPage = () => {
    const { orgId, id } = useParams();
    const { leads, fetchLeads } = useLeads();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLead = async () => {
            if (leads.length === 0) {
                await fetchLeads();
            }
            const found = leads.find(l => l.id === id);
            if (found) {
                setLead(found);
            } else {
                // If not found in current leads, it might be a direct link to a lead not yet loaded
                // The fetchLeads() should have handled it if it's in the org
            }
            setLoading(false);
        };
        loadLead();
    }, [id, leads, fetchLeads]);

    if (loading) {
        return (
            <div className="p-10 space-y-8 animate-pulse">
                <Skeleton className="h-12 w-48 bg-white/5" />
                <div className="flex gap-10">
                    <Skeleton className="h-[600px] flex-1 bg-white/5 rounded-3xl" />
                    <Skeleton className="h-[600px] w-80 bg-white/5 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-4">
                <div className="text-6xl">🔍</div>
                <h2 className="text-2xl font-black text-white">Lead Signal Lost</h2>
                <p className="text-muted-foreground max-w-sm">We couldn't locate lead record {id} in this organization's cluster.</p>
                <button 
                    onClick={() => navigate(`/org/${orgId}/leads`)}
                    className="px-6 h-12 bg-primary text-white font-bold rounded-xl"
                >
                    Return to Reservoir
                </button>
            </div>
        );
    }

    return (
        <div className="h-full bg-background overflow-y-auto">
            <LeadDetailPanel 
                lead={lead} 
                onClose={() => navigate(`/org/${orgId}/leads`)}
                onEdit={() => {}} // Can link to modal later
                onDeleteSuccess={() => {
                    toast.success("Lead purged from neural network.");
                    navigate(`/org/${orgId}/leads`);
                }}
            />
        </div>
    );
};

export default LeadDetailPage;
