import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Plus, User, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Modal } from '../../../components/ui/Modal';
import { api } from '../../../services/api';
import { BookAdditionRequest } from '../../../services/supabase';
import { format } from 'date-fns';

export function BookAdditionRequests() {
  const [requests, setRequests] = useState<BookAdditionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BookAdditionRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.getBookAdditionRequests('pending');
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest.id);
    try {
      await api.updateBookAdditionRequest(selectedRequest.id, actionType, notes);
      await loadRequests(); // Refresh the list
      setSelectedRequest(null);
      setNotes('');
      alert(`Request ${actionType}d successfully!`);
    } catch (error: any) {
      alert(error.message || `Failed to ${actionType} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const openActionModal = (request: BookAdditionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setNotes('');
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
          <Plus className="h-8 w-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Book Addition Requests</h2>
            <p className="text-white/70">Review student suggestions for new books</p>
          </div>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-green-500">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Plus className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {request.book_title}
                    </h3>
                    {request.author && (
                      <p className="text-white/70 mb-2">by {request.author}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-white/60 mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{request.profiles?.full_name}</span>
                      </div>
                      <span>ID: {request.profiles?.student_id}</span>
                      <span>Requested: {format(new Date(request.requested_at), 'MMM dd, yyyy')}</span>
                    </div>
                    {request.reference_link && (
                      <a
                        href={request.reference_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Reference Link</span>
                      </a>
                    )}
                    {request.description && (
                      <p className="text-white/70 mt-2 text-sm">{request.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => openActionModal(request, 'approve')}
                    disabled={!!processingId}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openActionModal(request, 'reject')}
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
              <Plus className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p>No pending book addition requests.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setNotes('');
        }}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Request`}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Request Details</h3>
              <p className="text-white/70">Book: {selectedRequest.book_title}</p>
              {selectedRequest.author && (
                <p className="text-white/70">Author: {selectedRequest.author}</p>
              )}
              <p className="text-white/70">
                Student: {selectedRequest.profiles?.full_name} ({selectedRequest.profiles?.student_id})
              </p>
              {selectedRequest.description && (
                <p className="text-white/70 mt-2">Description: {selectedRequest.description}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {actionType === 'approve' ? 'Approval Notes' : 'Rejection Reason'} (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  actionType === 'approve'
                    ? 'Add any notes about the approval...'
                    : 'Provide a reason for rejection...'
                }
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant={actionType === 'approve' ? 'success' : 'danger'}
                onClick={handleAction}
                loading={processingId === selectedRequest.id}
                className="flex-1"
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedRequest(null);
                  setNotes('');
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