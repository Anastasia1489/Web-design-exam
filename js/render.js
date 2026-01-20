function createProjectCard(project, onOpen) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.tabIndex = 0;

  const hasThumb = Boolean(project.thumbnail);

  card.innerHTML = `
    <div class="project-image">
      ${hasThumb ? `<img src="${project.thumbnail}" alt="${project.title}">` : ""}
      <span class="project-type">${project.year || ""}</span>
    </div>
    <div class="project-content">
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.subtitle || ""}</p>
      <div class="project-categories">
        ${(project.directions || [])
          .map((d) => `<span class="category-tag">${d}</span>`)
          .join("")}
      </div>
      <div class="project-media-info">
        <span>${
          project.primaryVideo
            ? "Видео + материалы"
            : project.primaryPdf
            ? "PDF‑презентация"
            : "Материалы проекта"
        }</span>
      </div>
    </div>
  `;

  if (hasThumb) {
    const img = card.querySelector(".project-image img");
    if (img) {
      img.loading = "lazy";
    }
  }

  function handleOpen() {
    onOpen(project);
  }

  card.addEventListener("click", handleOpen);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  });

  return card;
}

function clearContainer(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function renderProjectsGrid(container, projects, onOpen) {
  clearContainer(container);
  projects.forEach((project) => {
    container.appendChild(createProjectCard(project, onOpen));
  });
}

export function updateEmptyState(emptyNode, visibleCount) {
  emptyNode.hidden = visibleCount > 0;
}

export function updateActiveFiltersLabel(labelNode, filters) {
  labelNode.innerHTML = "";

  if (!filters.directions.length && !filters.difficulty) {
    const span = document.createElement("span");
    span.style.color = "#666";
    span.style.fontSize = "0.85rem";
    span.textContent = "Фильтры не выбраны";
    labelNode.appendChild(span);
    return;
  }

  filters.directions.forEach((d) => {
    const pill = document.createElement("div");
    pill.className = "active-filter";
    pill.textContent = d;
    labelNode.appendChild(pill);
  });

  if (filters.difficulty) {
    const pill = document.createElement("div");
    pill.className = "active-filter";
    pill.textContent = `Сложность: ${filters.difficulty}`;
    labelNode.appendChild(pill);
  }
}

export function attachModalHandlers() {
  const modal = document.getElementById("project-modal");
  const titleEl = document.getElementById("modal-title");
  const subtitleEl = document.getElementById("modal-subtitle");
  const difficultyEl = document.getElementById("modal-difficulty");
  const tagsTextEl = document.getElementById("modal-tags-text");
  const imageEl = document.getElementById("modal-image");
  const mediaEl = document.getElementById("modal-media");

  if (!modal) return { open: () => {}, close: () => {} };

  function close() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    mediaEl.innerHTML = "";
  }

  modal.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", close);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("modal--open")) {
      close();
    }
  });

  function open(project) {
    titleEl.textContent = project.title;
    subtitleEl.textContent = project.subtitle || "";
    difficultyEl.textContent = project.difficulty || "";

    tagsTextEl.textContent = (project.directions || []).join(" · ");

    if (imageEl) {
      if (project.thumbnail) {
        imageEl.src = project.thumbnail;
        imageEl.alt = project.title;
      } else {
        imageEl.removeAttribute("src");
        imageEl.alt = "";
      }
    }

    mediaEl.innerHTML = "";

    // Основной блок: pdf или видео
    if (project.primaryPdf) {
      const section = document.createElement("section");
      section.className = "media-section";
      section.innerHTML = `<h4>Основная презентация</h4>`;
      const iframe = document.createElement("iframe");
      iframe.src = project.primaryPdf;
      iframe.className = "pdf-viewer";
      iframe.title = project.title;
      section.appendChild(iframe);
      mediaEl.appendChild(section);
    } else if (project.primaryVideo) {
      const section = document.createElement("section");
      section.className = "media-section";
      section.innerHTML = `<h4>Видео‑презентация</h4>`;
      const wrapper = document.createElement("div");
      wrapper.className = "video-container";
      const video = document.createElement("video");
      video.src = project.primaryVideo;
      video.controls = true;
      video.playsInline = true;
      wrapper.appendChild(video);
      section.appendChild(wrapper);
      mediaEl.appendChild(section);
    }

    // Дополнительные файлы списком
    if (Array.isArray(project.extraFiles) && project.extraFiles.length) {
      const section = document.createElement("section");
      section.className = "media-section";
      section.innerHTML = `<h4>Файлы проекта</h4>`;
      const list = document.createElement("ul");
      list.style.listStyle = "none";
      list.style.padding = "0";
      list.style.margin = "0";
      project.extraFiles.forEach((file) => {
        const li = document.createElement("li");
        li.style.marginBottom = "0.5rem";
        const a = document.createElement("a");
        a.href = file.path;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.style.textDecoration = "none";
        a.style.color = "#1a1a1a";
        a.textContent = file.label || defaultLabel(file);
        li.appendChild(a);
        list.appendChild(li);
      });
      section.appendChild(list);
      mediaEl.appendChild(section);
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }

  return { open, close };
}

function createPlaceholder(title, label) {
  const root = document.createElement("div");
  root.className = "modal-media__placeholder";
  root.innerHTML = `
    <div class="modal-media__placeholder-top">
      <span class="modal-media__placeholder-title">${title}</span>
      <span class="modal-media__placeholder-label">${label}</span>
    </div>
    <div class="modal-media__placeholder-bottom">
      <div class="modal-media__placeholder-line"></div>
      <span class="modal-media__placeholder-text">
        Изображения и превью будут добавлены позже
      </span>
    </div>
  `;
  return root;
}

function defaultLabel(file) {
  if (file.type === "pdf") return "Открыть pdf";
  if (file.type === "video") return "Смотреть видео";
  return "Открыть файл";
}

