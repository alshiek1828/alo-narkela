/* ============================================
   الو نركيلة - Allo Narkila
   Main Application JavaScript
   ============================================ */

// ---- Firebase Config ----
var firebaseConfig = {
  apiKey: "AIzaSyDZt1RSz5d9wyn-C5S3kF8XVYjEldtSZss",
  authDomain: "gmae-fae90.firebaseapp.com",
  databaseURL: "https://gmae-fae90-default-rtdb.firebaseio.com",
  projectId: "gmae-fae90",
  storageBucket: "gmae-fae90.firebasestorage.app",
  messagingSenderId: "768482186329",
  appId: "1:768482186329:web:ae3b54ed2aaaf89d4e0d48",
  measurementId: "G-KGQ0RQ33XS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var storage = firebase.storage();

// ---- Image Upload State ----
var imageUploadState = {
  selectedFile: null,
  previewDataUrl: null,
  uploadedUrl: null
};

// ---- App State ----
var appState = {
  flavors: [],
  filteredFlavors: [],
  currentFilter: 'all',
  searchQuery: '',
  isAdminLoggedIn: false,
  logoClickCount: 0,
  logoClickTimer: null,
  editingFlavorId: null,
  pendingImageFile: null
};

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', function () {
  checkAdminState();
  initNavbar();
  initSidePanel();
  initScrollToTop();
  initPageAnimations();
  initHeroParticles();
  initImageUpload();
  trackVisitor();
  loadFlavors();
  loadStats();
  initSearchAndFilter();
});

// ============================================
//   ADMIN STATE
// ============================================
function checkAdminState() {
  var stored = localStorage.getItem('alloNarkilaAdmin');
  if (stored === 'true') {
    appState.isAdminLoggedIn = true;
  }
}

function handleLogoClick() {
  appState.logoClickCount++;
  clearTimeout(appState.logoClickTimer);

  if (appState.logoClickCount >= 5) {
    appState.logoClickCount = 0;
    if (appState.isAdminLoggedIn) {
      showPublicView();
    } else {
      openModal('loginModal');
      setTimeout(function () {
        var pwd = document.getElementById('loginPassword');
        if (pwd) pwd.focus();
      }, 300);
    }
  }

  appState.logoClickTimer = setTimeout(function () {
    appState.logoClickCount = 0;
  }, 2000);
}
window.handleLogoClick = handleLogoClick;

function handleLogin() {
  var pwdInput = document.getElementById('loginPassword');
  var correctPassword = 'AlloNark@2026!Admin#Secure';

  if (!pwdInput || pwdInput.value === correctPassword) {
    appState.isAdminLoggedIn = true;
    localStorage.setItem('alloNarkilaAdmin', 'true');
    closeModal('loginModal');
    showAdminView();
    showToast('مرحباً بك في لوحة التحكم', 'success');
    if (pwdInput) pwdInput.value = '';
  } else {
    showToast('كلمة المرور غير صحيحة', 'error');
    if (pwdInput) { pwdInput.value = ''; pwdInput.focus(); }
  }
}
window.handleLogin = handleLogin;

function handleLogout() {
  appState.isAdminLoggedIn = false;
  localStorage.removeItem('alloNarkilaAdmin');
  showPublicView();
  showToast('تم تسجيل الخروج', 'success');
}
window.handleLogout = handleLogout;

function showAdminView() {
  var pub = document.getElementById('publicView');
  var adm = document.getElementById('adminView');
  if (pub) pub.style.display = 'none';
  if (adm) adm.style.display = 'block';
  loadAdminFlavors();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPublicView() {
  var pub = document.getElementById('publicView');
  var adm = document.getElementById('adminView');
  if (pub) pub.style.display = 'block';
  if (adm) adm.style.display = 'none';
}

// ============================================
//   NAVIGATION
// ============================================
function initNavbar() {
  window.addEventListener('scroll', function () {
    var navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      if (navbar) navbar.classList.add('scrolled');
    } else {
      if (navbar) navbar.classList.remove('scrolled');
    }
  });
  highlightActiveNav();
}

function highlightActiveNav() {
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  var navLinks = document.querySelectorAll('.navbar-links a, .side-panel-nav a');

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    link.classList.remove('active');

    if (currentPath === 'index.html' || currentPath === '') {
      if (href === '#hero' || href === 'index.html' || href === '/') {
        link.classList.add('active');
      }
    } else {
      var linkFile = href.split('#')[0];
      if (linkFile === currentPath) {
        link.classList.add('active');
      }
    }
  });
}

// ============================================
//   SIDE PANEL (Mobile)
// ============================================
function initSidePanel() {
  var hamburger = document.getElementById('hamburgerBtn');
  var overlay = document.getElementById('sidePanelOverlay');
  var closeBtn = document.getElementById('sidePanelClose');

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      openSidePanel();
    });
  }
  if (overlay) {
    overlay.addEventListener('click', function () {
      closeSidePanel();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      closeSidePanel();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidePanel();
  });
}

function openSidePanel() {
  var panel = document.getElementById('sidePanel');
  var overlay = document.getElementById('sidePanelOverlay');
  if (panel) panel.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidePanel() {
  var panel = document.getElementById('sidePanel');
  var overlay = document.getElementById('sidePanelOverlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
//   SCROLL TO TOP
// ============================================
function initScrollToTop() {
  var scrollBtn = document.querySelector('.scroll-top');
  if (!scrollBtn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  scrollBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Smooth scroll for anchor links
document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  var target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  closeSidePanel();
  var offset = 80;
  var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: top, behavior: 'smooth' });
});

// ============================================
//   PAGE ANIMATIONS
// ============================================
function initPageAnimations() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  var elements = document.querySelectorAll('.fade-up, .fade-in, .scale-in');
  elements.forEach(function (el) { observer.observe(el); });
}

// ============================================
//   HERO PARTICLES
// ============================================
function initHeroParticles() {
  var container = document.querySelector('.hero-particles');
  if (!container) return;

  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.style.cssText = 'position:absolute;width:' + (Math.random() * 4 + 1) + 'px;height:' +
      (Math.random() * 4 + 1) + 'px;background:rgba(201,168,76,' + (Math.random() * 0.4 + 0.1) +
      ');border-radius:50%;top:' + (Math.random() * 100) + '%;left:' + (Math.random() * 100) +
      '%;animation:float ' + (Math.random() * 6 + 4) + 's ease-in-out infinite;animation-delay:' +
      (Math.random() * 4) + 's;';
    container.appendChild(p);
  }
}

// ============================================
//   VISITOR TRACKING
// ============================================
function trackVisitor() {
  var visitData = {
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    page: window.location.pathname,
    browser: getBrowserInfo()
  };

  fetch('https://ipapi.co/json/')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      visitData.ip = data.ip || '';
      visitData.country = data.country_name || '';
      visitData.city = data.city || '';
      database.ref('visits').push(visitData);
    })
    .catch(function () {
      database.ref('visits').push(visitData);
    });
}

function getBrowserInfo() {
  var ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

// ============================================
//   FLAVORS - LOAD & RENDER
// ============================================
function loadFlavors() {
  database.ref('flavors').on('value', function (snapshot) {
    var data = snapshot.val() || {};
    appState.flavors = [];

    Object.keys(data).forEach(function (key) {
      var f = data[key];
      appState.flavors.push({
        id: key,
        name: f.name || '',
        description: f.description || '',
        price: f.price || 0,
        available: f.available !== false,
        imageUrl: f.imageUrl || ''
      });
    });

    applyFilters();
    hideLoadingSpinner();
  }, function (error) {
    console.error('Firebase load error:', error);
    hideLoadingSpinner();
  });
}

function hideLoadingSpinner() {
  var spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.style.opacity = '0';
    setTimeout(function () { spinner.style.display = 'none'; }, 500);
  }
}

function showLoadingInGrid(grid) {
  if (!grid) return;
  var html = '';
  for (var i = 0; i < 6; i++) {
    html += '<div class="flavor-card skeleton"><div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>';
  }
  grid.innerHTML = html;
}

// ============================================
//   SEARCH & FILTER
// ============================================
function applyFilters() {
  var query = appState.searchQuery.toLowerCase();
  var filter = appState.currentFilter;

  appState.filteredFlavors = appState.flavors.filter(function (flavor) {
    var matchesSearch = flavor.name.toLowerCase().includes(query) ||
      (flavor.description || '').toLowerCase().includes(query);
    var matchesFilter = true;
    if (filter === 'available') matchesFilter = flavor.available;
    if (filter === 'unavailable') matchesFilter = !flavor.available;
    return matchesSearch && matchesFilter;
  });

  renderFlavors();
}

function createFlavorCard(flavor) {
  var imageUrl = flavor.imageUrl || '';
  var hasImage = imageUrl && imageUrl.trim() !== '';
  var firstLetter = (flavor.name || '?').charAt(0);
  var availClass = flavor.available ? 'available' : 'unavailable';
  var availText = flavor.available ? 'متوفر' : 'غير متوفر';
  var availIcon = flavor.available ? 'fa-check-circle' : 'fa-times-circle';
  var btnDisabled = flavor.available ? '' : 'disabled';

  var imageHtml;
  if (hasImage) {
    imageHtml = '<div class="flavor-card-image">' +
      '<img src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(flavor.name || 'نكهة') + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=\\\'image-placeholder\\\'><span>' + escapeHtml(firstLetter) + '</span></div>\'">' +
      '</div>';
  } else {
    imageHtml = '<div class="flavor-card-image"><div class="image-placeholder"><span>' + escapeHtml(firstLetter) + '</span></div></div>';
  }

  return '<div class="flavor-card fade-up">' +
    imageHtml +
    '<div class="flavor-card-body">' +
    '<div class="flavor-card-header">' +
    '<h3 class="flavor-name">' + escapeHtml(flavor.name) + '</h3>' +
    '<span class="badge badge-' + availClass + '"><i class="fas ' + availIcon + '"></i> ' + availText + '</span>' +
    '</div>' +
    '<p class="flavor-desc">' + escapeHtml(flavor.description || '') + '</p>' +
    '<div class="flavor-card-footer">' +
    '<span class="flavor-price">' + formatPrice(flavor.price) + '</span>' +
    '<button class="btn-whatsapp" ' + btnDisabled + ' onclick="orderViaWhatsApp(\'' + escapeJs(flavor.name) + '\', \'' + formatPrice(flavor.price) + '\')">' +
    '<i class="fab fa-whatsapp"></i> اطلب' +
    '</button>' +
    '</div>' +
    '</div>' +
    '</div>';
}

function renderFlavors() {
  var grid = document.getElementById('flavorsGrid');
  if (!grid) return;

  if (appState.filteredFlavors.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">' +
      '<div class="empty-icon"><i class="fas fa-box-open"></i></div>' +
      '<h3>لا توجد نكهات</h3>' +
      '<p>لم يتم العثور على نكهات تطابق البحث</p></div>';
    return;
  }

  var html = '';
  appState.filteredFlavors.forEach(function (flavor) {
    html += createFlavorCard(flavor);
  });
  grid.innerHTML = html;

  // Re-observe new fade-up elements
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.fade-up').forEach(function (el) { observer.observe(el); });
}

// ============================================
//   STATS
// ============================================
function loadStats() {
  database.ref('flavors').once('value', function (snapshot) {
    var data = snapshot.val() || {};
    var total = Object.keys(data).length;
    var available = 0;
    Object.keys(data).forEach(function (key) {
      if (data[key].available !== false) available++;
    });
    setStatNumber('statTotalFlavors', total);
    setStatNumber('statAvailable', available);
  });

  database.ref('orders').once('value', function (snapshot) {
    var data = snapshot.val() || {};
    var totalOrders = Object.keys(data).length;
    var flavorCounts = {};

    Object.keys(data).forEach(function (key) {
      var order = data[key];
      var flavor = order.flavor || order.flavors || order.item || order.name || '';
      flavorCounts[flavor] = (flavorCounts[flavor] || 0) + (Number(order.quantity) || 1);
    });

    setStatNumber('statTotalOrders', totalOrders);

    // Top flavor
    var sorted = Object.entries(flavorCounts).sort(function (a, b) { return b[1] - a[1]; });
    var topEl = document.getElementById('statTopFlavor');
    if (topEl && sorted.length > 0) {
      topEl.textContent = sorted[0][0] + ' (' + sorted[0][1] + ')';
    }
  });
}

function setStatNumber(elementId, number) {
  var el = document.getElementById(elementId);
  if (!el) return;
  animateNumber(el, 0, number, 1200);
}

function animateNumber(element, start, end, duration) {
  var startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(eased * (end - start) + start);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ============================================
//   MODALS
// ============================================
function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
window.openModal = openModal;

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
  // Check if any other modal is still open
  var anyOpen = document.querySelector('.modal-overlay.active');
  if (!anyOpen) document.body.style.overflow = '';
}
window.closeModal = closeModal;

function closeAllModals() {
  var modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(function (m) { m.classList.remove('active'); });
  document.body.style.overflow = '';
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    var anyOpen = document.querySelector('.modal-overlay.active');
    if (!anyOpen) document.body.style.overflow = '';
  }
});

// ============================================
//   TOAST NOTIFICATIONS
// ============================================
function showToast(message, type) {
  var container = document.querySelector('.toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  toast.innerHTML = '<i class="fas ' + icon + '"></i> ' + escapeHtml(message);
  container.appendChild(toast);

  setTimeout(function () { toast.classList.add('show'); }, 10);
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { toast.remove(); }, 400);
  }, 3500);
}
window.showToast = showToast;

// ============================================
//   ADMIN - FLAVORS CRUD
// ============================================
function loadAdminFlavors() {
  var grid = document.getElementById('adminFlavorsGrid');
  if (!grid) return;

  database.ref('flavors').once('value', function (snapshot) {
    var data = snapshot.val() || {};
    var flavors = [];

    Object.keys(data).forEach(function (key) {
      flavors.push({
        id: key,
        name: data[key].name || '',
        description: data[key].description || '',
        price: data[key].price || 0,
        available: data[key].available !== false,
        imageUrl: data[key].imageUrl || ''
      });
    });

    if (flavors.length === 0) {
      grid.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><h3>لا توجد نكهات</h3><p>اضغط "إضافة نكهة" لبدء إضافة المنتجات</p></div>';
      return;
    }

    var html = '';
    flavors.forEach(function (flavor) {
      var statusBadge = flavor.available
        ? '<span class="badge badge-available"><i class="fas fa-check-circle"></i> متوفر</span>'
        : '<span class="badge badge-unavailable"><i class="fas fa-times-circle"></i> غير متوفر</span>';

      var imagePreview = flavor.imageUrl
        ? '<div style="margin-top:8px;"><img src="' + escapeHtml(flavor.imageUrl) + '" class="image-preview-small" alt="preview" onerror="this.style.display=\'none\'"></div>'
        : '';

      html += '<div class="admin-flavor-card">' +
        '<div class="admin-flavor-header">' +
        '<div class="admin-flavor-info">' +
        '<h3>' + escapeHtml(flavor.name) + '</h3>' +
        '<p>' + formatPrice(flavor.price) + ' - ' + escapeHtml(flavor.description || 'بدون وصف') + '</p>' +
        statusBadge +
        imagePreview +
        '</div>' +
        '<div class="admin-actions">' +
        '<button class="btn-edit btn-sm" onclick="editFlavor(\'' + flavor.id + '\')"><i class="fas fa-edit"></i> تعديل</button>' +
        '<button class="btn-danger btn-sm" onclick="deleteFlavor(\'' + flavor.id + '\', \'' + escapeJs(flavor.name) + '\')"><i class="fas fa-trash"></i> حذف</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
  });
}

// ---- Add Flavor ----
function openAddModal() {
  appState.editingFlavorId = null;
  appState.pendingImageFile = null;
  imageUploadState = { selectedFile: null, previewDataUrl: null, uploadedUrl: null };

  var modalTitle = document.getElementById('addModalTitle');
  var nameInput = document.getElementById('flavorName');
  var descInput = document.getElementById('flavorDesc');
  var priceInput = document.getElementById('flavorPrice');
  var availSelect = document.getElementById('flavorAvailable');
  var imageInput = document.getElementById('flavorImageUrl');
  var submitBtn = document.getElementById('flavorSubmitBtn');

  if (modalTitle) modalTitle.textContent = 'إضافة نكهة جديدة';
  if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> إضافة النكهة';
  if (nameInput) nameInput.value = '';
  if (descInput) descInput.value = '';
  if (priceInput) priceInput.value = '';
  if (availSelect) availSelect.value = 'true';
  if (imageInput) imageInput.value = '';

  resetImagePreview();
  openModal('addFlavorModal');
  setTimeout(function () {
    if (nameInput) nameInput.focus();
  }, 300);
}
window.openAddModal = openAddModal;

// ---- Edit Flavor ----
function editFlavor(id) {
  database.ref('flavors/' + id).once('value', function (snapshot) {
    var flavor = snapshot.val();
    if (!flavor) {
      showToast('النكهة غير موجودة', 'error');
      return;
    }

    appState.editingFlavorId = id;
    appState.pendingImageFile = null;
    imageUploadState = { selectedFile: null, previewDataUrl: null, uploadedUrl: null };

    var modalTitle = document.getElementById('addModalTitle');
    var nameInput = document.getElementById('flavorName');
    var descInput = document.getElementById('flavorDesc');
    var priceInput = document.getElementById('flavorPrice');
    var availSelect = document.getElementById('flavorAvailable');
    var imageInput = document.getElementById('flavorImageUrl');
    var submitBtn = document.getElementById('flavorSubmitBtn');

    if (modalTitle) modalTitle.textContent = 'تعديل النكهة';
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
    if (nameInput) nameInput.value = flavor.name || '';
    if (descInput) descInput.value = flavor.description || '';
    if (priceInput) priceInput.value = flavor.price || '';
    if (availSelect) availSelect.value = flavor.available !== false ? 'true' : 'false';
    if (imageInput) imageInput.value = flavor.imageUrl || '';

    // Show existing image in preview
    if (flavor.imageUrl) {
      showImagePreviewFromUrl(flavor.imageUrl);
    } else {
      resetImagePreview();
    }

    openModal('addFlavorModal');
    setTimeout(function () {
      if (nameInput) nameInput.focus();
    }, 300);
  });
}
window.editFlavor = editFlavor;

// ---- Save Flavor (Add/Edit) ----
function saveFlavor() {
  var nameInput = document.getElementById('flavorName');
  var descInput = document.getElementById('flavorDesc');
  var priceInput = document.getElementById('flavorPrice');
  var availSelect = document.getElementById('flavorAvailable');
  var imageInput = document.getElementById('flavorImageUrl');

  var name = nameInput ? nameInput.value.trim() : '';
  var description = descInput ? descInput.value.trim() : '';
  var price = priceInput ? priceInput.value.trim() : '0';
  var available = availSelect ? availSelect.value === 'true' : true;
  var imageUrl = imageInput ? imageInput.value.trim() : '';

  // Validation
  if (!name) {
    showToast('يرجى إدخال اسم النكهة', 'error');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!price || isNaN(parseFloat(price))) {
    showToast('يرجى إدخال سعر صحيح', 'error');
    if (priceInput) priceInput.focus();
    return;
  }

  var submitBtn = document.getElementById('flavorSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
  }

  // If there's a pending file upload, upload first then save
  if (appState.pendingImageFile) {
    submitBtn.innerHTML = '<span class="inline-spinner" style="width:16px;height:16px;border-width:2px;"></span> جاري رفع الصورة...';
    uploadImageToStorage(appState.pendingImageFile, name)
      .then(function (downloadUrl) {
        imageUrl = downloadUrl;
        saveFlavorToDatabase(name, description, price, available, imageUrl, submitBtn);
      })
      .catch(function (err) {
        showToast('فشل رفع الصورة: ' + (err.message || 'خطأ غير معروف'), 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-save"></i> إضافة النكهة';
        }
      });
  } else {
    saveFlavorToDatabase(name, description, price, available, imageUrl, submitBtn);
  }
}
window.saveFlavor = saveFlavor;

function saveFlavorToDatabase(name, description, price, available, imageUrl, submitBtn) {
  var flavorData = {
    name: name,
    description: description,
    price: parseFloat(price),
    available: available,
    imageUrl: imageUrl
  };

  if (submitBtn) {
    submitBtn.innerHTML = '<span class="inline-spinner" style="width:16px;height:16px;border-width:2px;"></span> جاري الحفظ...';
  }

  if (appState.editingFlavorId) {
    database.ref('flavors/' + appState.editingFlavorId).update(flavorData)
      .then(function () {
        showToast('تم تحديث النكهة بنجاح', 'success');
        closeModal('addFlavorModal');
        loadAdminFlavors();
      })
      .catch(function (err) {
        showToast('حدث خطأ أثناء التحديث', 'error');
        console.error(err);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
        }
      });
  } else {
    database.ref('flavors').push(flavorData)
      .then(function () {
        showToast('تم إضافة النكهة بنجاح', 'success');
        closeModal('addFlavorModal');
        loadAdminFlavors();
      })
      .catch(function (err) {
        showToast('حدث خطأ أثناء الإضافة', 'error');
        console.error(err);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-save"></i> إضافة النكهة';
        }
      });
  }
}

// ---- Delete Flavor ----
function deleteFlavor(id, name) {
  var confirmMsg = 'هل أنت متأكد من حذف النكهة "' + (name || 'بدون اسم') + '"؟\nلا يمكن التراجع عن هذا الإجراء.';
  if (!confirm(confirmMsg)) return;

  database.ref('flavors/' + id).remove()
    .then(function () {
      showToast('تم حذف النكهة بنجاح', 'success');
      loadAdminFlavors();
    })
    .catch(function (err) {
      showToast('حدث خطأ أثناء الحذف', 'error');
      console.error(err);
    });
}
window.deleteFlavor = deleteFlavor;

// ============================================
//   IMAGE UPLOAD
// ============================================
function initImageUpload() {
  var uploadArea = document.getElementById('imageUploadArea');
  var fileInput = document.getElementById('flavorImageFile');
  var urlInput = document.getElementById('flavorImageUrl');

  if (!uploadArea || !fileInput) return;

  // Click to upload
  uploadArea.addEventListener('click', function (e) {
    if (e.target.closest('.image-remove-btn')) return;
    fileInput.click();
  });

  // File selected
  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (file) handleImageFile(file);
  });

  // Drag & Drop
  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    } else {
      showToast('يرجى اختيار ملف صورة', 'error');
    }
  });

  // URL input - show preview
  if (urlInput) {
    urlInput.addEventListener('input', function () {
      var url = urlInput.value.trim();
      if (url) {
        showImagePreviewFromUrl(url);
        appState.pendingImageFile = null;
        fileInput.value = '';
      } else {
        resetImagePreview();
      }
    });
  }
}

function handleImageFile(file) {
  if (file.size > 2 * 1024 * 1024) {
    showToast('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت', 'error');
    return;
  }

  appState.pendingImageFile = file;
  imageUploadState.selectedFile = file;

  var reader = new FileReader();
  reader.onload = function (e) {
    imageUploadState.previewDataUrl = e.target.result;
    var preview = document.getElementById('imagePreview');
    var placeholder = document.getElementById('imagePlaceholder');
    var removeBtn = document.getElementById('imageRemoveBtn');
    var urlInput = document.getElementById('flavorImageUrl');

    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'flex';
    if (urlInput) urlInput.value = '';
  };
  reader.readAsDataURL(file);
}

function showImagePreviewFromUrl(url) {
  var preview = document.getElementById('imagePreview');
  var placeholder = document.getElementById('imagePlaceholder');
  var removeBtn = document.getElementById('imageRemoveBtn');

  if (preview) {
    preview.src = url;
    preview.style.display = 'block';
    preview.onerror = function () { resetImagePreview(); };
  }
  if (placeholder) placeholder.style.display = 'none';
  if (removeBtn) removeBtn.style.display = 'flex';
  imageUploadState.previewDataUrl = url;
}

function removeImage() {
  resetImagePreview();
  var fileInput = document.getElementById('flavorImageFile');
  var urlInput = document.getElementById('flavorImageUrl');
  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';
  appState.pendingImageFile = null;
  imageUploadState = { selectedFile: null, previewDataUrl: null, uploadedUrl: null };
}
window.removeImage = removeImage;

function resetImagePreview() {
  var preview = document.getElementById('imagePreview');
  var placeholder = document.getElementById('imagePlaceholder');
  var removeBtn = document.getElementById('imageRemoveBtn');
  var progressDiv = document.getElementById('uploadProgress');

  if (preview) { preview.style.display = 'none'; preview.src = ''; preview.onerror = null; }
  if (placeholder) placeholder.style.display = 'block';
  if (removeBtn) removeBtn.style.display = 'none';
  if (progressDiv) progressDiv.style.display = 'none';
}

function uploadImageToStorage(file, flavorName) {
  return new Promise(function (resolve, reject) {
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المحدد ليس صورة'));
      return;
    }

    var progressDiv = document.getElementById('uploadProgress');
    var percentEl = document.getElementById('uploadPercent');
    var barEl = document.getElementById('uploadBar');
    if (progressDiv) progressDiv.style.display = 'block';
    if (percentEl) percentEl.textContent = '0%';
    if (barEl) barEl.style.width = '0%';

    var timestamp = Date.now();
    var safeName = (flavorName || 'flavor').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
    var fileName = 'flavors/' + safeName + '_' + timestamp + '.jpg';
    var storageRef = storage.ref(fileName);
    var uploadTask = storageRef.put(file);

    uploadTask.on('state_changed',
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (percentEl) percentEl.textContent = Math.round(progress) + '%';
        if (barEl) barEl.style.width = progress + '%';
      },
      function (error) {
        if (progressDiv) progressDiv.style.display = 'none';
        console.error('Upload error:', error);
        var msg = 'فشل رفع الصورة';
        if (error.code === 'storage/unauthorized') msg = 'ليس لديك صلاحية رفع الصور. فعّل Firebase Storage في لوحة تحكم Firebase.';
        else if (error.code === 'storage/canceled') msg = 'تم إلغاء الرفع';
        reject(new Error(msg));
      },
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          if (progressDiv) progressDiv.style.display = 'none';
          imageUploadState.uploadedUrl = downloadURL;
          resolve(downloadURL);
        }).catch(function (err) {
          if (progressDiv) progressDiv.style.display = 'none';
          reject(err);
        });
      }
    );
  });
}

// ============================================
//   WHATSAPP ORDER
// ============================================
function orderViaWhatsApp(flavorName, price) {
  var phone = '9647702604040';
  var message = 'مرحباً، أريد طلب:\n\nالنكهة: ' + flavorName + '\nالسعر: ' + price + ' د.ع\n\nأرجو تأكيد الطلب.';
  var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  window.open(url, '_blank');

  // Track order
  database.ref('orders').push({
    flavor: flavorName,
    quantity: 1,
    price: price,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    browser: getBrowserInfo()
  });
}
window.orderViaWhatsApp = orderViaWhatsApp;

// ============================================
//   SEARCH & FILTER (UI)
// ============================================
function initSearchAndFilter() {
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        appState.searchQuery = searchInput.value.trim();
        applyFilters();
      }, 300);
    });
  }
}

function setFilter(filter) {
  appState.currentFilter = filter;

  var buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(function (btn) {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    }
  });

  applyFilters();
}
window.setFilter = setFilter;

// ============================================
//   HELPERS
// ============================================
function formatPrice(num) {
  var p = parseFloat(String(num).replace(/[^\d.]/g, ''));
  if (isNaN(p)) return '0';
  if (p >= 1000) {
    return (p / 1000).toFixed(p % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + ' ألف د.ع';
  }
  return p + ' ألف د.ع';
}

function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function escapeJs(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ============================================
//   KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    var loginModal = document.getElementById('loginModal');
    if (loginModal && loginModal.classList.contains('active')) {
      handleLogin();
    }
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    var addModal = document.getElementById('addFlavorModal');
    if (addModal && addModal.classList.contains('active')) {
      var active = document.activeElement;
      if (active && active.tagName === 'TEXTAREA') return;
      e.preventDefault();
      saveFlavor();
    }
  }
});