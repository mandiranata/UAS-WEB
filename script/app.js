// Base API URL
const API_BASE_URL = "https://primdev.alwaysdata.net/api";

// Check if the user is logged in
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("api.html") && !localStorage.getItem("token")) {
        alert("Please log in first!");
        window.location.href = "login.html";
    }

    // Load blogs when on the dashboard
    if (window.location.pathname.includes("api.html")) {
        getBlogs();
    }
});

// Login Functionality
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                alert("Login successful!");
                window.location.href = "api.html";
            } else {
                alert(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    });
}

// Register Functionality
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, confirm_password: password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful! Please log in.");
                window.location.href = "login.html";
            } else {
                alert(data.message || "Failed to register");
            }
        } catch (error) {
            console.error("Error during registration:", error);
        }
    });
}

// Get Blogs (Read)
async function getBlogs() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_BASE_URL}/blog`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const blogs = await response.json();
        renderBlogs(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
    }
}

function renderBlogs(blogs) {
    const blogsContainer = document.getElementById("blogs-container");
    blogsContainer.innerHTML = ""; // Clear previous content

    blogs.forEach((blog) => {
        const blogElement = document.createElement("div");
        blogElement.className = "bg-white p-4 rounded shadow-md";
        blogElement.innerHTML = `
            <h3 class="font-bold text-lg text-gray-600">${blog.title}</h3>
            <p class="text-sm text-gray-600">${blog.content}</p>
            <div class="mt-4 flex space-x-2">
                <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="editBlog(${blog.id}, '${blog.title}', '${blog.content}')">
                    Edit
                </button>
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onclick="deleteBlog(${blog.id})">
                    Delete
                </button>
            </div>
        `;
        blogsContainer.appendChild(blogElement);
    });
}

// Create Blog
const newBlogForm = document.getElementById("new-blog-form");
if (newBlogForm) {
    newBlogForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("blog-title").value;
        const content = document.getElementById("blog-content").value;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/blog/store`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, content }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Blog created successfully!");
                getBlogs(); // Reload blogs
                newBlogForm.reset();
            } else {
                alert(data.message || "Failed to create blog");
            }
        } catch (error) {
            console.error("Error creating blog:", error);
        }
    });
}

// Update Blog
function editBlog(id, currentTitle, currentContent) {
    const newTitle = prompt("Edit Title:", currentTitle);
    const newContent = prompt("Edit Content:", currentContent);

    if (newTitle && newContent) {
        updateBlog(id, newTitle, newContent);
    }
}

async function updateBlog(id, title, content) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ _method: "put", title, content }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Blog updated successfully!");
            getBlogs(); // Reload blogs
        } else {
            alert(data.message || "Failed to update blog");
        }
    } catch (error) {
        console.error("Error updating blog:", error);
    }
}

// Delete Blog
async function deleteBlog(id) {
    if (confirm("Are you sure you want to delete this blog?")) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ _method: "delete" }),
            });

            if (response.ok) {
                alert("Blog deleted successfully!");
                getBlogs(); // Reload blogs
            } else {
                alert("Failed to delete blog");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
        }
    }
}

// Logout
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });
}