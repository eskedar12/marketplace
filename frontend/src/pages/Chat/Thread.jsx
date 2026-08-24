import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { conversationsApi } from '../../api/conversations.api.js';
import { ratingsApi } from '../../api/auth.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';
import { Textarea } from '../../components/common/Input.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function Thread() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [existingReview, setExistingReview] = useState(null); // rating already left for this listing, if any
  const [checkingReview, setCheckingReview] = useState(true);

  useEffect(() => {
    conversationsApi
      .getOne(id)
      .then((res) => setConversation(res.data))
      .catch((err) => setError(err.message));

    conversationsApi
      .getMessages(id)
      .then((res) => setMessages(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Same 30s-poll approach as NotificationBell — this app has no
  // websocket/SSE layer, so "live" here means "checks periodically".
  // A thread stays open a lot longer than the inbox does, so it polls
  // faster (5s) than the notification bell's 30s. Silent on failure —
  // a missed poll just means the next one catches it.
  useEffect(() => {
    const interval = setInterval(() => {
      conversationsApi
        .getMessages(id)
        .then((res) => setMessages(res.data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Once we know the conversation, check whether this buyer has already
  // rated the seller for this specific listing, so we can show that
  // review instead of a "Rate seller" button that would just 409.
  useEffect(() => {
    if (!conversation || !user || user.id !== conversation.buyer_id) {
      setCheckingReview(false);
      return;
    }
    ratingsApi
      .getForUser(conversation.seller_id)
      .then((res) => {
        const mine = (res.data.ratings || []).find(
          (r) => r.rater_id === user.id && r.listing_id === conversation.listing_id
        );
        setExistingReview(mine || null);
      })
      .catch(() => {})
      .finally(() => setCheckingReview(false));
  }, [conversation, user]);

  const otherUserName = conversation
    ? user?.id === conversation.buyer_id
      ? conversation.seller_name
      : conversation.buyer_name
    : '';
  // Only the buyer side of a conversation can rate — the seller is who's
  // being reviewed here.
  const isBuyer = conversation && user?.id === conversation.buyer_id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      const res = await conversationsApi.sendMessage(id, draft.trim());
      setMessages((m) => [...m, res.data]);
      setDraft('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await ratingsApi.create({
        rated_user_id: conversation.seller_id,
        listing_id: conversation.listing_id,
        score: reviewScore,
        comment: reviewComment.trim() || undefined,
      });
      setExistingReview(res.data);
      setShowReviewForm(false);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col h-[calc(100vh-8rem)]">
      <Link to="/messages" className="text-sm font-body text-ink/50 hover:text-ink mb-4">
        {t('chat.backToMessages')}
      </Link>

      {conversation && (
        <div className="pb-3 mb-1 border-b border-line">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display font-700 text-base text-ink">{otherUserName}</p>
              <Link
                to={`/listings/${conversation.listing_id}`}
                className="text-xs font-body text-ink/50 hover:text-mustard truncate block"
              >
                {t('chat.re', { title: conversation.listing_title })}
              </Link>
            </div>
            {isBuyer && !checkingReview && !existingReview && !showReviewForm && (
              <Button variant="outline" className="flex-shrink-0" onClick={() => setShowReviewForm(true)}>
                {t('chat.rateSeller')}
              </Button>
            )}
          </div>

          {existingReview && (
            <div className="mt-2 text-sm font-body text-ink/70">
              {t('chat.youRated')} <span className="font-600 text-ink">{existingReview.score} ★</span>
              {existingReview.comment && <span> — "{existingReview.comment}"</span>}
            </div>
          )}

          {showReviewForm && (
            <form onSubmit={submitReview} className="space-y-2 border border-line bg-white p-3 mt-3">
              <label className="block text-xs font-body font-600 text-ink/60 uppercase tracking-wide">
                {t('chat.yourRatingOf', { name: otherUserName })}
              </label>
              <select
                value={reviewScore}
                onChange={(e) => setReviewScore(Number(e.target.value))}
                className="border border-line px-3 py-2 text-sm font-body bg-white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
              <Textarea
                rows={2}
                placeholder={t('chat.commentPlaceholder')}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              {reviewError && <p className="text-clay text-sm font-body">{reviewError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? t('chat.submitting') : t('chat.submitReview')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)}>
                  {t('chat.cancel')}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {error && <p className="text-clay text-sm font-body mb-2">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-3 py-2">
        {loading ? (
          <Spinner />
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 text-sm font-body ${
                    mine ? 'bg-juniper text-paper' : 'bg-white border border-line text-ink'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-line">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('chat.writeMessage')}
          className="flex-1 border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper bg-white"
        />
        <Button type="submit">{t('chat.send')}</Button>
      </form>
    </div>
  );
}
