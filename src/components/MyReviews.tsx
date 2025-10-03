import React, { useState, useMemo } from 'react';
import type { Review } from '../app/page';
import type { User } from '@supabase/supabase-js';

interface MyReviewsProps {
  reviews: Review[];
  user: User | null;
  onDeleteReview?: (reviewId: number) => Promise<void>;
}

export default function MyReviews({ reviews, user, onDeleteReview }: MyReviewsProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [filterService, setFilterService] = useState<string>('');

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

  if (!user) {
    return <div className="text-center py-8 text-sm text-gray-500">Sign in to view your reviews.</div>;
  }

  if (myReviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 font-medium mb-2">You haven't written any reviews yet.</div>
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
              onChange={(e) => setSortBy(e.target.value as any)}
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
            <span>Cost: {review.cost.startsWith('₹') ? review.cost : `₹${review.cost}`}</span>
          </div>
          <p className="text-gray-800 leading-relaxed mb-4">{review.review_text}</p>
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">Created {new Date(review.created_at || review.date).toLocaleDateString()}</div>
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
      ))}
    </div>
  );
}
