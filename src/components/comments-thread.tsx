"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Reply, Check, Send } from "lucide-react";
import { DS } from "@/lib/constants";
import { Btn } from "@/components/ui/button";
import type { Comment } from "@/lib/supabase";

type CommentsThreadProps = {
  assetId: string;
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CommentItem({
  comment,
  replies,
  onReply,
  onResolve,
  isTopLevel,
}: {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string, body: string) => Promise<void>;
  onResolve: (commentId: string, resolved: boolean) => Promise<void>;
  isTopLevel: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyInput(false);
    setSubmitting(false);
  };

  return (
    <div
      className={`${comment.resolved ? "opacity-50" : ""}`}
      style={{ borderLeft: isTopLevel ? "none" : `2px solid ${DS.borderLight}`, paddingLeft: isTopLevel ? 0 : 16 }}
    >
      <div className="flex items-start gap-2.5 mb-1">
        {/* Avatar */}
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{ background: DS.primaryLighter, color: DS.primary }}
        >
          {comment.author_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-semibold" style={{ color: DS.fg }}>
              {comment.author_name}
            </span>
            <span className="text-[12px]" style={{ color: DS.mutedFg }}>
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          <p
            className={`text-[13px] mb-1.5 ${comment.resolved ? "line-through" : ""}`}
            style={{ color: comment.resolved ? DS.mutedFg : DS.muted }}
          >
            {comment.body}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="inline-flex items-center gap-1 text-[12px] font-medium hover:opacity-80 cursor-pointer"
              style={{ color: DS.mutedFg }}
            >
              <Reply size={12} /> Reply
            </button>
            {isTopLevel && (
              <button
                onClick={() => onResolve(comment.id, !comment.resolved)}
                className="inline-flex items-center gap-1 text-[12px] font-medium hover:opacity-80 cursor-pointer"
                style={{ color: comment.resolved ? DS.success : DS.mutedFg }}
              >
                <Check size={12} /> {comment.resolved ? "Unresolve" : "Resolve"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline reply input */}
      {showReplyInput && (
        <div className="flex items-center gap-2 mt-2 mb-2 ml-9">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReply()}
            placeholder="Write a reply..."
            className="flex-1 text-[13px] px-3 py-1.5 rounded-lg outline-none transition-shadow"
            style={{
              border: `1px solid ${DS.border}`,
              color: DS.fg,
            }}
          />
          <Btn size="small" disabled={submitting || !replyText.trim()} onClick={handleReply}>
            <Send size={13} />
          </Btn>
        </div>
      )}

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-2 ml-4 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              onResolve={onResolve}
              isTopLevel={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsThread({ assetId }: CommentsThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?asset_id=${assetId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: assetId, body: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        await fetchComments();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, body: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: assetId, parent_id: parentId, body }),
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch {
      // silently fail
    }
  };

  const handleResolve = async (commentId: string, resolved: boolean) => {
    try {
      const res = await fetch(`/api/comments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId, resolved }),
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch {
      // silently fail
    }
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} style={{ color: DS.muted }} />
        <h3 className="text-[14px] font-semibold" style={{ color: DS.fg }}>
          Comments
        </h3>
        {topLevel.length > 0 && (
          <span
            className="text-[12px] font-medium px-1.5 py-0.5 rounded"
            style={{ color: DS.mutedFg, background: DS.bg }}
          >
            {topLevel.length}
          </span>
        )}
      </div>

      {/* Add comment input */}
      <div className="flex items-center gap-2 mb-5">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          placeholder="Add a comment..."
          className="flex-1 text-[13px] px-3 py-2 rounded-lg outline-none transition-shadow"
          style={{
            border: `1px solid ${DS.border}`,
            color: DS.fg,
          }}
        />
        <Btn size="small" disabled={submitting || !newComment.trim()} onClick={handleAddComment}>
          <Send size={13} /> Post
        </Btn>
      </div>

      {loading ? (
        <p className="text-[13px]" style={{ color: DS.mutedFg }}>
          Loading comments...
        </p>
      ) : topLevel.length === 0 ? (
        <p className="text-[13px] text-center py-6" style={{ color: DS.mutedFg }}>
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-4">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              onReply={handleReply}
              onResolve={handleResolve}
              isTopLevel
            />
          ))}
        </div>
      )}
    </div>
  );
}
