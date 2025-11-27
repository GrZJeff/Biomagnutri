const API_URL = "http://localhost:5000/api";
let token = localStorage.getItem("token") || "";
let role = localStorage.getItem("role") || "";

// ------------------ Registro ------------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    alert(data.message);
  });
}

// ------------------ Login ------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const roleSelected = document.getElementById("loginRole").value;

    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: roleSelected })
    });

    const data = await res.json();
    if (data.token) {
      token = data.token;
      role = data.user.role;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      alert("Login exitoso");

      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "productos.html";
      }
    } else {
      alert(data.message);
    }
  });
}

// ------------------ Productos (solo usuarios) ------------------
const productFormUser = document.getElementById("productForm");
if (productFormUser && role === "user") {
  if (!token) {
    alert("Debes iniciar sesión como usuario para ver productos");
    window.location.href = "login.html";
  }

  productFormUser.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("prodName").value;
    const description = document.getElementById("prodDesc").value;
    const price = document.getElementById("prodPrice").value;

    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, price })
    });

    const data = await res.json();
    alert(data.message);
    loadProducts();
  });

  async function loadProducts() {
    const res = await fetch(`${API_URL}/products`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const products = await res.json();

    const list = document.getElementById("productList");
    if (!list) return;

    list.innerHTML = "";
    products.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} - $${p.price}`;
      list.appendChild(li);
    });
  }

  loadProducts();
}

// ------------------ Panel Admin ------------------
const userList = document.getElementById("userList");
const adminProductList = document.getElementById("adminProductList");
const adminForm = document.getElementById("productFormAdmin");

if ((userList || adminProductList || adminForm) && role === "admin") {
  if (!token) {
    alert("Acceso denegado. Solo administradores.");
    window.location.href = "login.html";
  }

  // Confirmación visual de sesión
  const statusDiv = document.getElementById("adminStatus");
  if (statusDiv) {
    statusDiv.textContent = "Bienvenida Magali, tu sesión está activa y protegida.";
  }

  // Cargar usuarios registrados en tabla
  async function loadUsers() {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "login.html";
        return;
      }

      const users = await res.json();

      if (!Array.isArray(users)) {
        alert(users.message || "Error al cargar usuarios");
        return;
      }

      if (!userList) return;
      userList.innerHTML = "";

      users.forEach(u => {
        const fecha = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${fecha}</td>
        `;
        userList.appendChild(row);
      });

      // Evitar duplicación del footer
      const existingFooter = userList.querySelector(".footer-row");
      if (!existingFooter) {
        const footerRow = document.createElement("tr");
        footerRow.classList.add("footer-row");
        footerRow.innerHTML = `
          <td colspan="3" style="text-align:center; font-weight:bold; padding-top:10px;">
            Usuarios nuevos registrados
          </td>
        `;
        userList.appendChild(footerRow);
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      alert("No se pudieron cargar los usuarios");
    }
  }

  // Cargar productos
  async function loadAdminProducts() {
    try {
      const res = await fetch(`${API_URL}/admin/products`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "login.html";
        return;
      }

      const products = await res.json();

      if (!Array.isArray(products)) {
        alert(products.message || "Error al cargar productos");
        return;
      }

      if (!adminProductList) return;
      adminProductList.innerHTML = "";
      products.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.name} - $${p.price}`;
        adminProductList.appendChild(li);
      });
    } catch (err) {
      console.error("Error al cargar productos:", err);
      alert("No se pudieron cargar los productos");
    }
  }

  // Agregar producto (solo en agregar-producto.html)
  if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("prodName").value;
      const description = document.getElementById("prodDesc").value;
      const price = document.getElementById("prodPrice").value;

      const res = await fetch(`${API_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, price })
      });

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "login.html";
        return;
      }

      const data = await res.json();
      alert(data.message);
      loadAdminProducts();
    });
  }

  loadUsers();
  loadAdminProducts();
}

// ------------------ Logout ------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Sesión cerrada");
    window.location.href = "index.html";
  });
}