// Feedback Table Management

// Load feedbacks from the database
async function loadFeedbacks() {
  try {
    const response = await fetch('/api/v1/feedback');
    const feedbacks = await response.json();
    const tbody = document.getElementById('feedback-tbody');
    tbody.innerHTML = '';
    
    feedbacks.forEach(fb => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fb.user}</td>
        <td>${fb.email}</td>
        <td>${fb.message}</td>
        <td>${new Date(fb.date).toLocaleString()}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteFeedback('${fb._id}')">
            <i class="bi bi-trash"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading feedbacks:', error);
    alert('Failed to load feedbacks');
  }
}

// Delete feedback
async function deleteFeedback(id) {
  if (!confirm('Are you sure you want to delete this feedback?')) return;

  try {
    const response = await fetch(`/api/v1/feedback/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadFeedbacks();
      alert('Feedback deleted successfully!');
    } else {
      throw new Error('Failed to delete feedback');
    }
  } catch (error) {
    console.error('Error deleting feedback:', error);
    alert('Failed to delete feedback');
  }
}

// Initialize the feedback table
document.addEventListener('DOMContentLoaded', () => {
  // Load feedbacks when the page loads
  loadFeedbacks();
}); 