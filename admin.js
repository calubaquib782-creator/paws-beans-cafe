const $ = id => document.getElementById(id);
const setupNotice=$('setupNotice'), loginPanel=$('loginPanel'), dashboard=$('dashboard'), logoutBtn=$('logoutBtn');
let items=[];

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('PASTE_')) setupNotice.classList.remove('hidden');

async function init(){
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('PASTE_')) return;
  const { data: { session } } = await window.pawsSupabase.auth.getSession();
  if(session) showDashboard();
}
$('loginBtn').onclick = async () => {
  $('loginMsg').textContent='Signing in...';
  const { error } = await window.pawsSupabase.auth.signInWithPassword({ email:$('email').value, password:$('password').value });
  if(error){ $('loginMsg').textContent = error.message; return; }
  $('loginMsg').textContent=''; showDashboard();
};
logoutBtn.onclick = async()=>{ await window.pawsSupabase.auth.signOut(); loginPanel.classList.remove('hidden'); dashboard.classList.add('hidden'); logoutBtn.classList.add('hidden'); };
async function showDashboard(){ loginPanel.classList.add('hidden'); dashboard.classList.remove('hidden'); logoutBtn.classList.remove('hidden'); await loadItems(); }
async function loadItems(){
  const { data, error } = await window.pawsSupabase.from('menu_items').select('*').order('sort_order',{ascending:true}).order('name',{ascending:true});
  if(error){ $('adminList').innerHTML = `<p class="msg">${error.message}</p>`; return; }
  items=data||[]; renderList();
}
function renderList(){
  $('adminList').innerHTML = items.map(item=>`<div class="admin-item"><img src="${item.image_url||'images/iced-latte.jpg'}"><div><h3>${item.name}</h3><p>${item.category||''} • ${item.price||''} ${item.available===false?'• Out of stock':''}</p></div><button onclick="editItem('${item.id}')">Edit</button><button class="danger" onclick="deleteItem('${item.id}')">Delete</button></div>`).join('') || '<p>No items yet. Click Import starter menu.</p>';
}
async function uploadImage(file){
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await window.pawsSupabase.storage.from('menu-images').upload(filename, file, { upsert:false });
  if(error) throw error;
  const { data } = window.pawsSupabase.storage.from('menu-images').getPublicUrl(filename);
  return data.publicUrl;
}
$('saveBtn').onclick = async()=>{
  $('formMsg').textContent='Saving...';
  try{
    let image_url = $('imageUrl').value.trim();
    const file = $('imageFile').files[0];
    if(file) image_url = await uploadImage(file);
    const payload = { name:$('name').value.trim(), price:$('price').value.trim(), category:$('category').value.trim(), description:$('description').value.trim(), image_url, available:$('available').checked, sort_order:Number($('sortOrder').value||0) };
    if(!payload.name) throw new Error('Product name is required.');
    const id = $('itemId').value;
    const res = id ? await window.pawsSupabase.from('menu_items').update(payload).eq('id', id) : await window.pawsSupabase.from('menu_items').insert(payload);
    if(res.error) throw res.error;
    $('formMsg').textContent='Saved successfully.'; clearForm(); await loadItems();
  }catch(err){ $('formMsg').textContent=err.message; }
};
function editItem(id){ const item=items.find(x=>x.id===id); if(!item)return; $('formTitle').textContent='Edit Menu Item'; $('itemId').value=item.id; $('name').value=item.name||''; $('price').value=item.price||''; $('category').value=item.category||''; $('description').value=item.description||''; $('imageUrl').value=item.image_url||''; $('available').checked=item.available!==false; $('sortOrder').value=item.sort_order||0; window.scrollTo({top:0,behavior:'smooth'}); }
async function deleteItem(id){ if(!confirm('Delete this item?'))return; const {error}=await window.pawsSupabase.from('menu_items').delete().eq('id',id); if(error) alert(error.message); await loadItems(); }
function clearForm(){ ['itemId','name','price','category','description','imageUrl','sortOrder'].forEach(id=>$(id).value=''); $('available').checked=true; $('imageFile').value=''; $('formTitle').textContent='Add Menu Item'; }
$('clearBtn').onclick=clearForm;
$('importBtn').onclick=async()=>{ if(!confirm('Import starter menu items?'))return; const rows=starterMenu.map((x,i)=>({...x, sort_order:i+1})); const {error}=await window.pawsSupabase.from('menu_items').insert(rows); if(error) alert(error.message); await loadItems(); };
init();
