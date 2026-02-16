document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      renderActivities(activities);

      // Add option to select dropdown
      Object.entries(activities).forEach(([name, details]) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  function renderActivities(activities) {
    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";

    Object.entries(activities).forEach(([name, details]) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      let participantsHTML = '';
      if (details.participants.length > 0) {
        participantsHTML = details.participants.map(email => `
          <li class="participant-item">
            <span class="participant-email">${email}</span>
            <span class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${email}">&#128465;</span>
          </li>
        `).join("");
      } else {
        participantsHTML = '<li class="no-participants">No participants yet.</li>';
      }

      card.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Max Participants:</strong> ${details.max_participants}</p>
        <div class="participants-section">
          <strong>Participants:</strong>
          <ul class="participants-list">
            ${participantsHTML}
          </ul>
        </div>
      `;

      activitiesList.appendChild(card);
    });

    // Add event listeners for delete icons
    document.querySelectorAll('.delete-participant').forEach(icon => {
      icon.addEventListener('click', async (e) => {
        const activity = e.target.getAttribute('data-activity');
        const email = e.target.getAttribute('data-email');
        if (confirm(`Remove ${email} from ${activity}?`)) {
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            if (response.ok) {
              fetchActivities();
            } else {
              const data = await response.json();
              alert(data.detail || 'Failed to unregister participant.');
            }
          } catch (err) {
            alert('Failed to unregister participant.');
          }
        }
      });
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so UI updates immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
