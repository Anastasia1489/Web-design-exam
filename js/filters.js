export function collectDirectionOptions(projects) {
  const set = new Set();
  projects.forEach((p) => {
    (p.directions || []).forEach((d) => set.add(d));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
}

export function collectDifficultyOptions(projects) {
  const order = ["Лёгкая", "Средняя", "Сложная"];
  const present = new Set(projects.map((p) => p.difficulty).filter(Boolean));
  return order.filter((lvl) => present.has(lvl));
}

export function applyFilters(projects, filters) {
  return projects.filter((project) => {
    const byDirection =
      !filters.directions.length ||
      (project.directions || []).some((d) =>
        filters.directions.includes(d)
      );

    const byDifficulty =
      !filters.difficulty || project.difficulty === filters.difficulty;

    return byDirection && byDifficulty;
  });
}

export function initFilterChips({
  directionContainer,
  difficultyContainer,
  directions,
  difficulties,
  initialFilters,
  onChange
}) {
  const filters = {
    directions: [...(initialFilters.directions || [])],
    difficulty: initialFilters.difficulty || null
  };

  function toggleDirection(direction) {
    const exists = filters.directions.includes(direction);
    filters.directions = exists
      ? filters.directions.filter((d) => d !== direction)
      : [...filters.directions, direction];
    onChange({ ...filters });
    render();
  }

  function setDifficulty(level) {
    filters.difficulty = filters.difficulty === level ? null : level;
    onChange({ ...filters });
    render();
  }

  function render() {
    directionContainer.innerHTML = "";
    directions.forEach((direction) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className =
        "category-btn" +
        (filters.directions.includes(direction) ? " active" : "");
      chip.textContent = direction;
      chip.addEventListener("click", () => toggleDirection(direction));
      directionContainer.appendChild(chip);
    });

    difficultyContainer.innerHTML = "";
    difficulties.forEach((level) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className =
        "type-btn" + (filters.difficulty === level ? " active" : "");
      chip.textContent = level;
      chip.addEventListener("click", () => setDifficulty(level));
      difficultyContainer.appendChild(chip);
    });
  }

  render();

  return {
    getFilters() {
      return { ...filters };
    },
    reset() {
      filters.directions = [];
      filters.difficulty = null;
      onChange({ ...filters });
      render();
    }
  };
}

