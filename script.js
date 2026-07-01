const menuEl = document.getElementById('menu');
const filtersEl = document.getElementById('categoryFilters');
document.getElementById('year').textContent = new Date().getFullYear();
let menuItems = [];
let activeCategory = 'All';

async function loadMenu() {
  try {
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('PASTE_')) throw new Error('Supabase key missing');
    const { data, error } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });
    if (error) throw error;
    menuItems = data && data.length ? data : starterMenu;
  } catch (err) {
    menuItems = starterMenu;
  }
  renderFilters();
  renderMenu();
}
function renderFilters() {
  const cats = ['All', ...new Set(menuItems.map(i => i.category || 'Menu'))];
  filtersEl.innerHTML = cats.map(cat => `<button class="chip ${cat===activeCategory?'active':''}" onclick="setCategory('${cat.replace(/'/g, "\\'")}')">${cat}</button>`).join('');
}
function setCategory(cat){ activeCategory = cat; renderFilters(); renderMenu(); }
function renderMenu(){
  const shown = activeCategory === 'All' ? menuItems : menuItems.filter(i => (i.category || 'Menu') === activeCategory);
  menuEl.innerHTML = shown.map(item => `
    <article class="card ${item.available === false ? 'muted' : ''}">
      <img src="${item.image_url || item.image || 'images/iced-latte.jpg'}" alt="${item.name}" loading="lazy">
      <div class="card-body"><div class="row"><h3>${item.name}</h3><strong>${item.price || ''}</strong></div>
      <p>${item.description || ''}</p>${item.available === false ? '<span class="badge">Out of stock</span>' : ''}</div>
    </article>`).join('');
}
loadMenu();
