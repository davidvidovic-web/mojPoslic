export interface Review {
  id: string
  job_id: string | null
  reviewer_id: string | null
  reviewee_id: string | null
  assignment_id: string | null
  rating: number
  comment: string | null
  reviewer_name: string
  reviewer_avatar_url: string | null
  response: string | null
  response_at: string | null
  created_at: string
}

export interface CreateReviewData {
  job_id: string
  reviewee_id: string
  assignment_id?: string
  rating: number
  comment?: string
}

export interface ReviewResponse {
  review_id: string
  response: string
}
