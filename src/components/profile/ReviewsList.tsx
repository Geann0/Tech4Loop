"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  updateReview,
  deleteReview,
  type Review,
} from "@/app/conta/avaliacoes/actions";
import type { Product } from "@/types";

interface ReviewsListProps {
  reviews: Array<{
    review: Review;
    product: Product;
  }>;
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (reviews.length === 0) {
    return (
      <div className="bg-dark-card border border-gray-800 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">★</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Nenhuma avaliação ainda
        </h3>
        <p className="text-gray-400 mb-6">
          Compre produtos e deixe sua opinião para ajudar outros clientes
        </p>
        <Link
          href="/conta/compras"
          className="inline-block px-6 py-3 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-lg hover:shadow-glow transition-all"
        >
          Ver Minhas Compras
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">
        {reviews.length} {reviews.length === 1 ? "Avaliação" : "Avaliações"}
      </h2>

      <div className="space-y-4">
        {reviews.map(({ review, product }) => (
          <div
            key={review.id}
            className="bg-dark-card border border-gray-800 rounded-xl p-6"
          >
            {editingId === review.id ? (
              <ReviewEditForm
                review={review}
                product={product}
                onCancel={() => setEditingId(null)}
                onSuccess={() => setEditingId(null)}
              />
            ) : (
              <>
                {/* Cabeçalho com produto */}
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-700">
                  <Link
                    href={`/produtos/${product.slug}`}
                    className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900"
                  >
                    {product.images && product.images.length > 0 && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="font-bold text-white hover:text-neon-blue transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= review.rating
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(review.id)}
                      className="text-gray-400 hover:text-white p-2"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(review.id)}
                      className="text-gray-400 hover:text-red-400 p-2"
                      title="Excluir"
                    >
                      ✕︎
                    </button>
                  </div>
                </div>

                {/* Conteúdo da avaliação */}
                <div>
                  <h3 className="font-bold text-white mb-2">{review.title}</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              </>
            )}

            {/* Modal de confirmação de exclusão */}
            {deleteConfirm === review.id && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-dark-card border border-gray-800 rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Tem certeza que deseja excluir esta avaliação?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await deleteReview(review.id);
                        setDeleteConfirm(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewEditForm({
  review,
  product,
  onCancel,
  onSuccess,
}: {
  review: Review;
  product: Product;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title);
  const [comment, setComment] = useState(review.comment);

  const actionWithId = updateReview.bind(null, review.id);
  const initialState = { error: null, success: false };
  const [state, formAction] = useFormState(actionWithId, initialState);

  const handleSubmit = async (formData: FormData) => {
    await formAction(formData);
    if (state?.success) {
      onSuccess();
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {state?.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Avaliação *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition-colors ${
                star <= rating ? "text-yellow-400" : "text-gray-600"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Título *
        </label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
          placeholder="Resumo da sua opinião"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Comentário *
        </label>
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={10}
          rows={4}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue resize-none"
          placeholder="Conte sua experiência com o produto..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-lg hover:shadow-glow transition-all"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
