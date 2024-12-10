const modal = document.getElementById("post-modal"),
  closeBtn = document.querySelector(".close-btn"),
  newPostBtn = document.getElementById("new-post-btn"),
  newPostForm = document.getElementById("new-post-form"),
  blogPosts = document.getElementById("blog-posts"),
  deletePhotoBtn = document.getElementById("delete-photo-btn");
let editingPostIndex = null, currentPostImage = null;

// Load posts on page load
document.addEventListener("DOMContentLoaded", loadPosts);
newPostBtn.addEventListener("click", () => {
  modal.style.display = "block";
  newPostForm.reset();
  deletePhotoBtn.style.display = "none"; // Hide Delete Photo button for new posts
  editingPostIndex = null;
  currentPostImage = null;
});
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});
newPostForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value,
    author = document.getElementById("author").value,
    content = document.getElementById("content").value,
    imageInput = document.getElementById("image").files[0],
    posts = JSON.parse(localStorage.getItem("posts")) || [],
    date = new Date().toLocaleDateString();

  let imageUrl = currentPostImage || ""; // Use current image if it exists
  if (imageInput) {
    imageUrl = await convertToBase64(imageInput); // Convert new image to Base64
  }

  editingPostIndex !== null
    ? (posts[editingPostIndex] = { title, author, content, imageUrl, date })
    : posts.push({ title, author, content, imageUrl, date });

  localStorage.setItem("posts", JSON.stringify(posts));
  loadPosts();
  modal.style.display = "none";
  newPostForm.reset();
  currentPostImage = null;
});

// Delete photo
deletePhotoBtn.addEventListener("click", () => {
  currentPostImage = null; // Clear the image
  deletePhotoBtn.style.display = "none"; // Hide the Delete Photo button
  alert("Photo removed. Save changes to confirm."); // Notify the user
});

// Load posts
function loadPosts() {
  blogPosts.innerHTML = "";
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  if (!posts.length)
    return (blogPosts.innerHTML = `<p>No blog posts yet. Click "New Post" to add one!</p>`);
  posts.forEach((post, i) => {
    const truncatedContent = post.content.slice(0, 100),
      postElement = document.createElement("div");
    postElement.className = "blog-post";
    postElement.innerHTML = `
      <h2>${post.title}</h2>
      <p class="post-meta">By ${post.author} | ${post.date}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" class="post-image" />` : ""}
      <p class="post-content">${truncatedContent}</p><span class="dots">...</span>
      <button class="read-more-btn">Read More</button>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;
    postElement.querySelector(".read-more-btn").addEventListener("click", () =>
      toggleReadMore(postElement.querySelector(".read-more-btn"), post.content, truncatedContent)
    );
    postElement.querySelector(".edit-btn").addEventListener("click", () => editPost(i));
    postElement.querySelector(".delete-btn").addEventListener("click", () => deletePost(i));
    blogPosts.appendChild(postElement);
  });
}

// Convert image to Base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Toggle Read More / Read Less
function toggleReadMore(button, fullContent, truncatedContent) {
  const postElement = button.parentElement,
    contentEl = postElement.querySelector(".post-content"),
    dotsEl = postElement.querySelector(".dots");
  if (button.textContent === "Read More") {
    contentEl.textContent = fullContent;
    dotsEl.style.display = "none";
    button.textContent = "Read Less";
  } else {
    contentEl.textContent = truncatedContent;
    dotsEl.style.display = "inline";
    button.textContent = "Read More";
  }
}

// Edit post
function editPost(i) {
  const post = JSON.parse(localStorage.getItem("posts"))[i];
  editingPostIndex = i;
  modal.style.display = "block";
  document.getElementById("title").value = post.title;
  document.getElementById("author").value = post.author;
  document.getElementById("content").value = post.content;
  currentPostImage = post.imageUrl; // Set current image
  deletePhotoBtn.style.display = post.imageUrl ? "block" : "none"; // Show or hide Delete Photo button
}

// Delete post
function deletePost(i) {
  if (confirm("Are you sure you want to delete this post?")) {
    const posts = JSON.parse(localStorage.getItem("posts"));
    posts.splice(i, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    loadPosts();
  }
}

