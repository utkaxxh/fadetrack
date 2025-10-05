import React, { useState, useMemo } from 'react';
import type { Review } from '../app/page';
import type { User } from '@supabase/supabase-js';

interface MyReviewsProps {
  reviews: Review[];
  user: User | null;
  onDeleteReview?: (reviewId: number) => Promise<void>;
  onReviewUpdated?: () => Promise<void> | void; // ask parent to refetch after edit
}

export default function MyReviews({ reviews, user, onDeleteReview, onReviewUpdated }: MyReviewsProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [filterService, setFilterService] = useState<string>('');
  const [editing, setEditing] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);

  const myReviews = useMemo(() => {
    const mine = reviews.filter(r => user && r.user_email === user.email);
    return mine.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    }).filter(r => !filterService || r.service_type === filterService);
  }, [reviews, user, sortBy, filterService]);

  const handleDelete = async (reviewId: number) => {
    if (!onDeleteReview) return;
    const ok = window.confirm('Delete this review permanently?');
    if (!ok) return;
    setDeletingId(reviewId);
    try {
      await onDeleteReview(reviewId);
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (review: Review) => setEditing(review);
  const closeEdit = () => setEditing(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing || !user?.email) return;
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload: {
      id?: number;
      user_email: string;
      title?: string;
      review_text?: string;
      cost?: string;
      service_type?: string;
      is_public?: boolean;
      rating?: number;
      date?: string;
    } = {
      id: editing.id,
      user_email: user.email,
      title: formData.get('title') as string,
      review_text: formData.get('review_text') as string,
      cost: formData.get('cost') as string,
      service_type: formData.get('service_type') as string,
      is_public: (formData.get('is_public') as string) === 'on',
      rating: Number(formData.get('rating')),
      date: formData.get('date') as string,
    };
    try {
      const res = await fetch('/api/updateReview', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Failed to update review' + (err.error ? `: ${err.error}` : ''));
        return;
      }
      if (onReviewUpdated) await onReviewUpdated();
      closeEdit();
    } catch (err) {
      console.error('Update review error:', err);
      alert('Failed to update review.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="text-center py-8 text-sm text-gray-500">Sign in to view your reviews.</div>;
  }

  if (myReviews.length === 0) {
    return (
      <div className="text-center py-12">
  <div className="text-gray-600 font-medium mb-2">You haven&apos;t written any reviews yet.</div>
        <div className="text-gray-500 text-sm">Share your experience with a makeup artist to see it here.</div>
      </div>
    );
  }

  const uniqueServices = Array.from(new Set(myReviews.map(r => r.service_type)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'rating')}
              className="px-3 py-2 border rounded-md text-sm bg-slate-100 focus:bg-white focus:outline-none"
              style={{ borderColor: 'rgba(17,75,95,0.3)', color: '#114B5F' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Filter Service</label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-slate-100 focus:bg-white focus:outline-none"
              style={{ borderColor: 'rgba(17,75,95,0.3)', color: '#114B5F' }}
            >
              <option value="">All Services</option>
              {uniqueServices.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>
        <div className="text-xs text-gray-500">{myReviews.length} review{myReviews.length !== 1 ? 's' : ''}</div>
      </div>

      {myReviews.map(review => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
            <div className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</div>
          </div>
          <div className="text-sm text-gray-600 mb-3 flex flex-wrap gap-x-4 gap-y-1">
            <span>Artist: <span className="text-blue-600 font-medium">{review.barber_name}</span></span>
            <span>Venue: {review.shop_name}</span>
            <span>Service: {review.service_type.replace('_',' ')}</span>
            <span>Rating: {review.rating}★</span>
            {review.cost && review.cost.trim() !== '' && (
              <span>Cost: {review.cost.startsWith('₹') ? review.cost : `₹${review.cost}`}</span>
            )}
          </div>
          <p className="text-gray-800 leading-relaxed mb-4">{review.review_text}</p>
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">Created {new Date(review.created_at || review.date).toLocaleDateString()}</div>
            <div className="flex items-center gap-2">
              {review.id && (
                <button
                  onClick={() => openEdit(review)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Edit
                </button>
              )}
              {review.id && (
                <button
                  onClick={() => handleDelete(review.id!)}
                  disabled={deletingId === review.id}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${deletingId === review.id ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                >
                  {deletingId === review.id ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {editing && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div className="w-full max-w-xl rounded-lg bg-white shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-semibold text-gray-800">Edit Review</h4>
              <button onClick={closeEdit} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" defaultValue={editing.title} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                  <input name="rating" type="number" min={1} max={5} defaultValue={editing.rating} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input name="date" type="date" defaultValue={editing.date.split('T')[0] || editing.date} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <input name="service_type" defaultValue={editing.service_type} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                  <input name="cost" defaultValue={editing.cost} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea name="review_text" defaultValue={editing.review_text} rows={5} className="w-full border rounded-md px-3 py-2" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="is_public" defaultChecked={editing.is_public} /> Make review public
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeEdit} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
                <button type="submit" disabled={saving} className={`px-4 py-2 text-sm rounded-md text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
