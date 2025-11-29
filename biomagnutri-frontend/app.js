const API_URL = "https://biomagnutrii.vercel.app/";
let token = localStorage.getItem("token") || "";
let role = localStorage.getItem("role") || "";

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
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("email", data.user.email);

      localStorage.setItem("isLoggedIn", "true");





      alert("Login exitoso");

      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      alert(data.message);
    }
  });
}

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

const userList = document.getElementById("userList");
const adminProductList = document.getElementById("adminProductList");
const adminForm = document.getElementById("productFormAdmin");

if ((userList || adminProductList || adminForm) && role === "admin") {
  if (!token) {
    alert("Acceso denegado. Solo administradores.");
    window.location.href = "login.html";
  }

  const statusDiv = document.getElementById("adminStatus");
  if (statusDiv) {
    statusDiv.textContent = "Bienvenida Magali, tu sesión está activa y protegida.";
  }

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

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");
    alert("Sesión cerrada");
     const navRight = document.querySelector(".nav-right");
    const userMenu = document.getElementById("userMenu");
    if (navRight) navRight.style.display = "flex"; // vuelve a mostrarlos
    if (userMenu) userMenu.style.display = "none"; // oculta el menú de bienvenida


    window.location.href = "index.html";
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const userMenu = document.getElementById("userMenu");
  const userNameBtn = document.getElementById("userNameBtn");
  const userDropdown = document.getElementById("userDropdown");
  const navRight = document.querySelector(".nav-right");
  const name = localStorage.getItem("name");

  if (name && userMenu && userNameBtn) {
    // Usuario logueado
    userMenu.style.display = "block";
    userNameBtn.textContent = `Bienvenido, ${name}`;
    if (navRight) navRight.style.display = "none";
  } else {
    // Usuario NO logueado
    if (navRight) navRight.style.display = "flex";
    if (userMenu) userMenu.style.display = "none";
  }

  // 👇 Aquí controlamos el despliegue del menú
  if (userNameBtn && userDropdown) {
    userNameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!userNameBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove("show");
      }
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const role = document.getElementById("loginRole").value;

      // Aquí podrías validar contra tu backend o datos guardados
      if (email && password && role) {
        // Guardar sesión en localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);

        // Opcional: mostrar nombre en el header
        localStorage.setItem("name", email.split("@")[0]);

        alert("Inicio de sesión exitoso");
        window.location.href = role === "admin" ? "admin.html" : "index.html";
      } else {
        alert("Por favor completa todos los campos.");
      }
    });
  }

  // Manejo de logout en cualquier página
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
});
});