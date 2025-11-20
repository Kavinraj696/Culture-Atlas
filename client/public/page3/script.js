let currentPageIndex = 0;
let totalPages = 0;
let countryData = null;

document.getElementById("searchBtn").addEventListener("click", async () => {
  const countryInput = document.getElementById("countryInput");
  const country = countryInput.value.trim();
  const originalPlaceholder = "Search Country(e.g.,India)";

  if (!country) {
    countryInput.value = "";
    countryInput.placeholder = "Please enter a country!";
    countryInput.classList.add("highlight");

    setTimeout(() => {
      countryInput.placeholder = originalPlaceholder;
      countryInput.classList.remove("highlight");
    }, 2000);
    return;
  }

  try {
    const res = await fetch(`/api/country/${country}`);
    const data = await res.json();

    if (data.error) {
      alert("Country not found!");
      return;
    }

    countryData = data;
    currentPageIndex = 0;
    totalPages = 4; // We have 3 page spreads (6 pages total)

    const book = document.getElementById("book");
    const cover = document.getElementById("frontCover");
    const navigationControls = document.querySelector(".navigation-controls");

    // Hide static cover image and search bar immediately
    document.getElementById("cover-image").style.display = "none";
    document.getElementById("search-bar").style.display = "none";

    // Step 1: Move the book slightly to the right with its front cover visible
    book.style.transition = 'transform 1s ease-in-out';
    book.style.transform = 'translateX(-23%) scale(1)';
    book.style.opacity = '1';
    book.style.visibility = 'visible';

    // Step 2: After moving right, open the book
    setTimeout(() => {
      book.classList.add("open");
      cover.classList.add("open");
      
      const closeBtn = document.getElementById("closeBookBtn");
      closeBtn.classList.remove("hidden");
      closeBtn.style.zIndex = "30";
      closeBtn.style.position = "absolute";
      closeBtn.style.opacity = "1";
      closeBtn.style.visibility = "visible";

      // Show first page spread
      setTimeout(() => {
        showPageSpread(0);
        navigationControls.classList.add("visible");
      }, 950);
    }, 1000);

  } catch (err) {
    alert("Error fetching country data!");
    console.error(err);
  }
});

function showPageSpread(index) {
  const leftPage = document.getElementById("leftPage");
  const rightPage = document.getElementById("rightPage");

  leftPage.classList.remove("visible", "flipping-back");
  rightPage.classList.remove("visible", "flipping");

  setTimeout(() => {
    if (index === 0) {
      // First spread: Map on left, Introduction on right
      leftPage.innerHTML = `
        <div class="title-div">
          <h2>${countryData.name}</h2>
          <img src="data:image/png;base64,${countryData.flag}">
        </div>
        <img src="data:image/png;base64,${countryData.map}" style="width:100%; height:570px; object-fit:fit; border:1px solid #ccc; margin-bottom:15px">
      `;

      rightPage.innerHTML = `
        <h3>Introduction</h3>
        <img src="data:image/png;base64,${countryData.locators}" class="intro-img" style="width:70px; height:70px; object-fit:fit">
        <p>${formatContent(countryData.details?.Introduction?.Background?.text)}</p>
      `;
    } else if (index === 1) {
      // Second spread: Geography and People & Society
      leftPage.innerHTML = `
        <h3>Geography</h3>
        <div>${formatSectionContent(countryData.details?.Geography)}</div>
      `;

      rightPage.innerHTML = `
        <h3>Transportation</h3>
        <div>${formatSectionContent(countryData.details?.Transportation)}</div>
      `;
    } else if (index === 2) {
      // Third spread: Government and Economy
      leftPage.innerHTML = `
        <h3>Government</h3>
        <div>${formatSectionContent(countryData.details?.Government)}</div>
      `;

      rightPage.innerHTML = `
        <h3>Economy</h3>
        <div>${formatSectionContent(countryData.details?.Economy)}</div>
      `;
    } else if (index === 3) {
      // Third spread: Government and Economy
      leftPage.innerHTML = `
        <h3>Energy</h3>
        <div>${formatSectionContent(countryData.details?.Energy)}</div>
      `;

      rightPage.innerHTML = `
        <h3>Communications</h3>
        <div>${formatSectionContent(countryData.details?.Communications)}</div>
      `;
    }

    leftPage.classList.add("visible");
    rightPage.classList.add("visible");
    updateNavigationButtons();
  }, 50);
}

function nextPage() {
  if (currentPageIndex < totalPages - 1) {
    const rightPage = document.getElementById("rightPage");
    rightPage.classList.add("flipping");

    setTimeout(() => {
      currentPageIndex++;
      rightPage.classList.remove("flipping");
      showPageSpread(currentPageIndex);
    }, 50);
  }
}

function prevPage() {
  if (currentPageIndex > 0) {
    const leftPage = document.getElementById("leftPage");
    leftPage.classList.add("flipping-back");

    setTimeout(() => {
      currentPageIndex--;
      leftPage.classList.remove("flipping-back");
      showPageSpread(currentPageIndex);
    }, 40);
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageCounter = document.getElementById("pageCounter");

  prevBtn.disabled = currentPageIndex === 0;
  nextBtn.disabled = currentPageIndex === totalPages - 1;
  pageCounter.textContent = `${currentPageIndex + 1} / ${totalPages}`;
}

document.getElementById("closeBookBtn").addEventListener("click", () => {
  const book = document.getElementById("book");
  const cover = document.getElementById("frontCover");
  const leftPage = document.getElementById("leftPage");
  const rightPage = document.getElementById("rightPage");
  const navigationControls = document.querySelector(".navigation-controls");

  navigationControls.classList.remove("visible");
  leftPage.classList.remove("visible");
  rightPage.classList.remove("visible");
  cover.classList.remove("open");
  book.classList.remove("open");

  setTimeout(() => {
    book.style.transition = 'transform 1s ease-in-out, opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
    book.style.transform = 'translateX(-50%) scale(1)';
    book.style.opacity = "0";
    book.style.visibility = "hidden";
    document.getElementById("cover-image").style.display = "block";
    document.getElementById("search-bar").style.display = "block";
    document.getElementById("closeBookBtn").classList.add("hidden");
    
    // Reset page index
    currentPageIndex = 0;
    countryData = null;
  }, 2500);
});

function formatContent(obj) {
  if (!obj) return '';
  return typeof obj === 'object' ? JSON.stringify(obj, null, 2) : obj;
}

function formatSectionContent(section) {
  if (!section) return '<p style="color: #666;">No data available</p>';
  
  let html = '';
  const entries = Object.entries(section).slice(0, 8);
  
  entries.forEach(([key, value]) => {
    const text = typeof value === 'object' && value?.text ? value.text : 
                 typeof value === 'string' ? value : 
                 JSON.stringify(value);
    
    html += `
      <div class="section-content">
        <h4>${key.replace(/_/g, ' ')}</h4>
        <p>${text.substring(0, 300)}${text.length > 300 ? '...' : ''}</p>
      </div>
    `;
  });
  
  return html;
}
