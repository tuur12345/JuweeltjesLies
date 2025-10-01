'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.from('feedback').insert([
        { message }
      ])
      if (error) throw error
      setSuccess(true)
      setMessage('') // clear input
    } catch (err) {
      setError(err.message || 'Failed to send feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feedback-form-container">
      <h1 className="page-title">Geef feedback</h1>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Typ je feedback hier..."
          required
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Versturen...' : 'Stuur feedback'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">Bedankt voor je feedback!</p>}
    </div>
  )
}
