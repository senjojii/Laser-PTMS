const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    const initialProjects = [
      { name: "Harbor District Tower", client: "Harbor Group", manager: "Maya Chen", start: "2026-02-10", budget: 4200000, progress: 65, status: "Ongoing", priority: "High", description: "Structural package and tower construction.", contractor: "BuildCore Construction" },
      { name: "Riverfront Plaza", client: "Riverfront Holdings", manager: "Alex Reyes", start: "2026-03-15", budget: 3100000, progress: 42, status: "Ongoing", priority: "High", description: "Foundation package and podium works.", contractor: "Riverfront Builders" },
      { name: "North Dock Terminal", client: "North Dock Co.", manager: "Maya Chen", start: "2025-11-01", budget: 5100000, progress: 88, status: "Ongoing", priority: "Medium", description: "Terminal finishing and fit-out package.", contractor: "Northline Contractors" }
    ];
    let projects = [...initialProjects];
    let currentUserName = "";

    function showToast(message) {
      const toast = $("#toast");
      toast.textContent = message;
      toast.classList.remove("hidden");
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 3200);
    }

    function formatDisplayName(username) {
      return username.trim().split("@")[0]
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
    }

    function updateLoginGreeting() {
      const displayName = formatDisplayName($("#username").value);
      $("#loginGreetingName").textContent = displayName ? `, ${displayName}` : "";
    }

    $("#username").addEventListener("input", updateLoginGreeting);
    updateLoginGreeting();

    $("#togglePassword").addEventListener("click", () => {
      const password = $("#password");
      const showing = password.type === "text";
      password.type = showing ? "password" : "text";
      $("#togglePassword").setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });

    $("#loginForm").addEventListener("submit", event => {
      event.preventDefault();
      const username = $("#username").value.trim();
      const password = $("#password").value;
      const error = $("#loginError");
      error.textContent = "";
      if (!username || !password) {
        error.textContent = "Enter both your username and password.";
        (!username ? $("#username") : $("#password")).focus();
        return;
      }
      if (password.length < 8) {
        error.textContent = "Password must contain at least 8 characters.";
        $("#password").focus();
        return;
      }
      // Demo only: replace this with a real server-side authentication request.
      currentUserName = formatDisplayName(username) || username;
      $("#footerName").textContent = currentUserName;
      $("#footerAvatar").textContent = currentUserName
        .split(/\s+/)
        .map(part => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
      $("#loginScreen").classList.add("hidden");
      $("#appScreen").classList.remove("hidden");
      switchView("dashboard");
      renderProjects();
    });
    $("#forgotPassword").addEventListener("click", () => showToast("Connect this action to your password-reset workflow."));
    $("#requestInvite").addEventListener("click", () => showToast("Connect this action to your employee invitation workflow."));
    $("#helpButton").addEventListener("click", () => showToast("Help center is a demo action."));
    $("#signOut").addEventListener("click", () => {
      $("#appScreen").classList.add("hidden");
      $("#loginScreen").classList.remove("hidden");
      $("#loginError").textContent = "";
    });

    function switchView(view) {
      const views = { dashboard: ["dashboardView", "Dashboard", `Welcome back, ${currentUserName}. Here's what is happening across your sites.`],
                      projects: ["projectsView", "Projects", "Search and manage your construction projects."],
                      records: ["recordsView", "Records", "Permits, deliveries, QA checklists, and site documents."] };
      Object.keys(views).forEach(key => $("#" + views[key][0]).classList.toggle("hidden", key !== view));
      $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
      $("#pageTitle").textContent = views[view][1];
      $("#pageSubtitle").textContent = views[view][2];
      if (view === "projects") renderProjects();
    }
    $$(".nav-item").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
    $("#viewProjectsButton").addEventListener("click", () => switchView("projects"));

    function money(value) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    }
    function statusClass(status) {
      if (status === "Completed") return "completed";
      if (status === "On Hold") return "on-hold";
      return "";
    }
    function renderProjects() {
      const body = $("#projectTableBody");
      const name = ($("#filterName")?.value || "").trim().toLowerCase();
      const status = $("#filterStatus")?.value || "";
      const priority = $("#filterPriority")?.value || "";
      const client = $("#filterClient")?.value || "";
      const manager = $("#filterManager")?.value || "";
      const from = $("#dateFrom")?.value || "";
      const to = $("#dateTo")?.value || "";
      const min = $("#minBudget")?.value === "" ? null : Number($("#minBudget").value);
      const max = $("#maxBudget")?.value === "" ? null : Number($("#maxBudget").value);
      const sort = $("#sortBy")?.value || "name";
      let filtered = projects.filter(p =>
        p.name.toLowerCase().includes(name) &&
        (!status || p.status === status) &&
        (!priority || p.priority === priority) &&
        (!client || p.client === client) &&
        (!manager || p.manager === manager) &&
        (!from || p.start >= from) && (!to || p.start <= to) &&
        (min === null || p.budget >= min) && (max === null || p.budget <= max)
      );
      filtered.sort((a,b) => sort === "date" ? a.start.localeCompare(b.start) :
        sort === "budget" ? a.budget-b.budget : sort === "progress" ? b.progress-a.progress : a.name.localeCompare(b.name));
      body.innerHTML = "";
      filtered.forEach((p) => {
        const index = projects.indexOf(p);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td><strong></strong><div class="project-desc"></div></td><td></td><td></td><td></td><td></td><td><div style="display:flex;align-items:center;gap:7px"><div class="progress-track" style="width:65px"><div class="progress-fill" style="width:${p.progress}%"></div></div>${p.progress}%</div></td><td><span class="status ${statusClass(p.status)}"></span></td><td><button class="table-action" data-edit="${index}">View / edit</button></td>`;
        tr.cells[0].querySelector("strong").textContent = p.name;
        tr.cells[0].querySelector("div").textContent = p.description;
        tr.cells[1].textContent = p.client;
        tr.cells[2].textContent = p.manager;
        tr.cells[3].textContent = p.start;
        tr.cells[4].textContent = money(p.budget);
        tr.cells[6].querySelector(".status").textContent = p.status;
        body.appendChild(tr);
      });
      $("#emptyProjects").classList.toggle("hidden", filtered.length !== 0);
      $("#assignedCount").textContent = projects.length;
      const recent = $("#recentProjectList");
      recent.innerHTML = "";
      projects.slice(0,3).forEach(p => {
        const div = document.createElement("div");
        div.className = "project-row";
        div.dataset.search = (p.name + " " + p.description).toLowerCase();
        div.innerHTML = `<div class="project-top"><strong></strong><span>${p.progress}%</span></div><div class="project-desc"></div><div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div>`;
        div.querySelector("strong").textContent = p.name;
        div.querySelector(".project-desc").textContent = `${p.status} · ${p.priority} priority`;
        recent.appendChild(div);
      });
      $$("[data-edit]").forEach(button => button.addEventListener("click", () => {
        const p = projects[Number(button.dataset.edit)];
        openProjectModal(p);
      }));
    }

    $("#workspaceSearch").addEventListener("input", event => {
      const query = event.target.value.trim().toLowerCase();
      if (!$("#projectsView").classList.contains("hidden")) {
        $("#filterName").value = query;
        renderProjects();
      } else {
        $$(".project-row", $("#recentProjectList")).forEach(row => {
          row.classList.toggle("hidden", !row.dataset.search.includes(query));
        });
      }
    });

    $("#filterForm").addEventListener("submit", event => {
      event.preventDefault();
      const error = $("#filterError");
      error.textContent = "";
      if ($("#dateFrom").value && $("#dateTo").value && $("#dateFrom").value > $("#dateTo").value) {
        error.textContent = "The start of the date range must be before or equal to the end date.";
        $("#dateTo").focus();
        return;
      }
      if ($("#minBudget").value !== "" && $("#maxBudget").value !== "" && Number($("#minBudget").value) > Number($("#maxBudget").value)) {
        error.textContent = "Minimum budget cannot exceed maximum budget.";
        $("#maxBudget").focus();
        return;
      }
      renderProjects();
    });
    $("#filterForm").addEventListener("reset", () => setTimeout(() => { $("#filterError").textContent = ""; renderProjects(); }, 0));

    const modal = $("#projectModal");
    let editingIndex = null;
    function openProjectModal(project = null) {
      editingIndex = project ? projects.indexOf(project) : null;
      $("#projectForm").reset();
      $("#projectFormError").textContent = "";
      $("#modalTitle").textContent = project ? "Edit project" : "Add new project";
      $("#projectName").value = project?.name || "";
      $("#projectClient").value = project?.client || "";
      $("#projectDescription").value = project?.description || "";
      $("#projectBudget").value = project?.budget ?? "";
      $("#projectContractor").value = project?.contractor || "";
      $("#projectManager").value = project?.manager || "";
      $("#projectPriority").value = project?.priority || "";
      $("#projectStart").value = project?.start || "";
      $("#projectEnd").value = project?.end || "";
      $("#projectStatus").value = project?.status || "Pending";
      modal.classList.remove("hidden");
      $("#projectName").focus();
    }
    function closeProjectModal() { modal.classList.add("hidden"); }
    $("#addProjectButton").addEventListener("click", () => openProjectModal());
    $("#closeModal").addEventListener("click", closeProjectModal);
    $("#cancelProject").addEventListener("click", closeProjectModal);
    modal.addEventListener("click", event => { if (event.target === modal) closeProjectModal(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.classList.contains("hidden")) closeProjectModal(); });

    $("#projectForm").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      const error = $("#projectFormError");
      error.textContent = "";
      if (!form.reportValidity()) return;
      const start = $("#projectStart").value;
      const end = $("#projectEnd").value;
      if (end < start) {
        error.textContent = "Expected end date cannot be earlier than the start date.";
        $("#projectEnd").focus();
        return;
      }
      const project = {
        name: $("#projectName").value.trim(),
        client: $("#projectClient").value.trim(),
        description: $("#projectDescription").value.trim(),
        budget: Number($("#projectBudget").value),
        contractor: $("#projectContractor").value.trim(),
        manager: $("#projectManager").value,
        priority: $("#projectPriority").value,
        start,
        end,
        status: $("#projectStatus").value,
        progress: $("#projectStatus").value === "Completed" ? 100 : 0
      };
      if (editingIndex === null) projects.push(project);
      else projects[editingIndex] = { ...projects[editingIndex], ...project };
      closeProjectModal();
      renderProjects();
      showToast(editingIndex === null ? "Project added to this demo session." : "Project updated in this demo session.");
    });

    $$("#urgentTasks input").forEach(input => input.addEventListener("change", () => {
      const remaining = $$("#urgentTasks input").filter(box => !box.checked).length;
      $("#urgentRemaining").textContent = remaining;
      $("#openTaskCount").textContent = Math.max(0, 25 - $$("#urgentTasks input:checked").length);
    }));

    // Initialize the sample project table for when the Projects tab is opened.
    renderProjects();
