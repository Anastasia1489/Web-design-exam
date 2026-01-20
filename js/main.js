import { loadFilters, saveFilters } from "./storage.js";
import {
  collectDirectionOptions,
  collectDifficultyOptions,
  applyFilters,
  initFilterChips
} from "./filters.js";
import {
  renderProjectsGrid,
  updateEmptyState,
  updateActiveFiltersLabel,
  attachModalHandlers
} from "./render.js";

async function loadProjects() {
  const response = await fetch("./data/projects.json");
  if (!response.ok) {
    throw new Error("Не удалось загрузить проекты");
  }
  return response.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("projects-grid");
  const emptyState = document.getElementById("empty-state");
  const activeFiltersLabel = document.getElementById("active-filters-label");
  const resetBtn = document.getElementById("reset-filters");
  const clearEmptyBtn = document.getElementById("clear-filters-empty");
  const techFiltersNode = document.getElementById("tech-filters");
  const difficultyFiltersNode = document.getElementById("difficulty-filters");

  if (
    !grid ||
    !emptyState ||
    !activeFiltersLabel ||
    !resetBtn ||
    !techFiltersNode ||
    !difficultyFiltersNode
  ) {
    return;
  }

  let allProjects = [];
  let currentFilters = loadFilters();

  const modal = attachModalHandlers();

  function handleFiltersChange(newFilters) {
    currentFilters = { ...newFilters };
    saveFilters(currentFilters);
    applyAndRender();
  }

  function applyAndRender() {
    const filtered = applyFilters(allProjects, currentFilters);
    renderProjectsGrid(grid, filtered, modal.open);
    updateEmptyState(emptyState, filtered.length);
    updateActiveFiltersLabel(activeFiltersLabel, currentFilters);
  }

  try {
    allProjects = await loadProjects();
    const directionOptions = collectDirectionOptions(allProjects);
    const difficultyOptions = collectDifficultyOptions(allProjects);

    const filtersApi = initFilterChips({
      directionContainer: techFiltersNode,
      difficultyContainer: difficultyFiltersNode,
      directions: directionOptions,
      difficulties: difficultyOptions,
      initialFilters: currentFilters,
      onChange: handleFiltersChange
    });

    resetBtn.addEventListener("click", () => {
      filtersApi.reset();
    });

    if (clearEmptyBtn) {
      clearEmptyBtn.addEventListener("click", () => {
        filtersApi.reset();
      });
    }

    applyAndRender();
  } catch (e) {
    grid.innerHTML =
      '<p style="color:#b00020;font-size:14px">Ошибка загрузки проектов</p>';
    console.error(e);
  }
});

