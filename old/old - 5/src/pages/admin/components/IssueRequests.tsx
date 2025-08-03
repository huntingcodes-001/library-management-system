import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Book } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Modal } from '../../../components/ui/Modal';
import { api } from '../../../services/api';
import { IssueRequest } from '../../../services/supabase';
import { format } from 'date-fns';

export function IssueRequests() {
  const [requests, setRequests] = useState<IssueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IssueRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.getIssueRequests('pending');
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await api.updateIssueRequest(requestId, 'approved');
      await loadRequests(); // Refresh the list
      alert('Request approved successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest.id);
    try {
      await api.updateIssueRequest(selectedRequest.id, 'rejected', rejectionReason);
      await loadRequests(); // Refresh the list
      setSelectedRequest(null);
      setRejectionReason('');
      alert('Request rejected successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-8 w-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Issue Requests</h2>
            <p className="text-white/70">Review and process book issue requests</p>
          </div>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <Book className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {request.books?.title}
                    </h3>
                    <p className="text-white/70 mb-2">by {request.books?.author}</p>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{request.profiles?.full_name}</span>
                      </div>
                      <span>ID: {request.profiles?.student_id}</span>
                      <span>Requested: {format(new Date(request.requested_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(request.id)}
                    loading={processingId === request.id}
                    disabled={!!processingId}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                    disabled={!!processingId}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-8 text-white/70">
              <Clock className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p>No pending issue requests at the moment.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Rejection Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setRejectionReason('');
        }}
        title="Reject Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Request Details</h3>
              <p className="text-white/70">Book: {selectedRequest.books?.title}</p>
              <p className="text-white/70">Student: {selectedRequest.profiles?.full_name} ({selectedRequest.profiles?.student_id})</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Provide a reason for rejection..."
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="danger"
                onClick={handleReject}
                loading={processingId === selectedRequest.id}
                className="flex-1"
              >
                Confirm Rejection
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}