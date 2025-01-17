// DOM Elements
const modal = document.getElementById("post-modal"),
  closeBtn = document.querySelector(".close-btn"),
  newPostBtn = document.getElementById("new-post-btn"),
  newPostForm = document.getElementById("new-post-form"),
  blogPosts = document.getElementById("blog-posts"),
  deletePhotoBtn = document.getElementById("delete-photo-btn"),
  savePostBtn = document.getElementById("save-post-btn");

// Variables to track the editing post and current image
let editingPostIndex = null,
  currentPostImage = null;

// Event listeners
document.addEventListener("DOMContentLoaded", loadPosts);

newPostBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
savePostBtn.addEventListener("click", savePost);
deletePhotoBtn.addEventListener("click", removePostImage);

// Open modal for creating or editing a post
function openModal() {
  modal.style.display = "block";
  newPostForm.reset();
  deletePhotoBtn.style.display = "none"; // Hide Delete Photo button
  editingPostIndex = null;
  currentPostImage = null;
}

// Close the modal and reset state
function closeModal() {
  modal.style.display = "none";
  editingPostIndex = null;
  currentPostImage = null;
}

// Save post logic (triggered by the save button)
async function savePost(e) {
  e.preventDefault(); // Prevent default form submission

  const title = document.getElementById("title").value.trim(),
    author = document.getElementById("author").value.trim(),
    content = document.getElementById("content").value.trim(),
    imageInput = document.getElementById("image").files[0],
    date = new Date().toLocaleDateString();

  // Validate input fields
  if (!title || !author || !content) {
    alert("Please fill in all fields.");
    return; // Prevent saving if fields are empty
  }

  // Convert image to Base64 if provided
  let imageUrl = currentPostImage || "";
  if (imageInput) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(imageInput.type)) {
      alert("Invalid image type. Only JPEG, PNG, and GIF are allowed.");
      return;
    }
    imageUrl = await convertToBase64(imageInput);
  }

  // Initialize posts array if not present
  const posts = JSON.parse(localStorage.getItem("posts")) || [];

  // If editing, update the post, otherwise add a new one
  const postData = { title, author, content, imageUrl, date };
  if (editingPostIndex !== null) {
    posts[editingPostIndex] = postData;
  } else {
    posts.push(postData);
  }

  // Save posts to localStorage
  localStorage.setItem("posts", JSON.stringify(posts));

  // Display the post immediately on the frontend
  if (editingPostIndex === null) {
    addPostToFrontend(postData, posts.length - 1);
  } else {
    loadPosts(); // Reload posts if editing
  }

  closeModal(); // Close modal after saving
}

// Delete the post image
function removePostImage() {
  currentPostImage = null; // Clear the image
  deletePhotoBtn.style.display = "none"; // Hide Delete Photo button
  alert("Photo removed. Save changes to confirm.");
}

// Function to load and display all posts
function loadPosts() {
  blogPosts.innerHTML = "";
  const posts = JSON.parse(localStorage.getItem("posts")) || []; // Use fallback []

  // If there are no posts, show a message
  if (!posts.length) {
    blogPosts.innerHTML = `<p>No blog posts yet. Click "New Post" to add one!</p>`;
    return;
  }

  // Loop through posts and display them
  posts.forEach((post, i) => addPostToFrontend(post, i));
}

// Function to add a single post to the frontend
function addPostToFrontend(post, index) {
  const truncatedContent =
    post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content;
  const postElement = document.createElement("div");
  postElement.className = "blog-post";

  // Build post HTML
  postElement.innerHTML = `
    <h2>${post.title}</h2>
    <p class="post-meta">By ${post.author} | ${post.date}</p>
    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" class="post-image" />` : ""}
    <p class="post-content">${truncatedContent}</p>
    <button class="read-more-btn">Read More</button>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  `;

  // Add event listeners for buttons
  postElement.querySelector(".read-more-btn").addEventListener("click", () =>
    toggleReadMore(postElement.querySelector(".read-more-btn"), post.content, truncatedContent)
  );
  postElement.querySelector(".edit-btn").addEventListener("click", () => editPost(index));
  postElement.querySelector(".delete-btn").addEventListener("click", () => deletePost(index));

  // Append post to the blog list
  blogPosts.appendChild(postElement);
}

// Function to convert image file to Base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Function to toggle Read More / Read Less
function toggleReadMore(button, fullContent, truncatedContent) {
  const postElement = button.parentElement,
    contentEl = postElement.querySelector(".post-content");

  if (button.textContent === "Read More") {
    contentEl.textContent = fullContent;
    button.textContent = "Read Less";
  } else {
    contentEl.textContent = truncatedContent;
    button.textContent = "Read More";
  }
}

// Function to open the post editor
function editPost(i) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts[i];
  editingPostIndex = i;

  modal.style.display = "block";
  document.getElementById("title").value = post.title;
  document.getElementById("author").value = post.author;
  document.getElementById("content").value = post.content;
  currentPostImage = post.imageUrl;
  deletePhotoBtn.style.display = post.imageUrl ? "block" : "none";
}

// Function to delete a post
function deletePost(i) {
  if (confirm("Are you sure you want to delete this post?")) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.splice(i, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    loadPosts();
  }
}
