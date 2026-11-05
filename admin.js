const { createClient } = supabase;
const cfg = window.ZEN_CONFIG || {};
const ready = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_URL.includes("PASTE_") && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
const db = ready ? createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
let editingId = null, currentImage = null;
const $ = id => document.getElementById(id);
const money = n => "₹" + Number(n || 0).toLocaleString("en-IN");
const say = (id, msg) => $(id).textContent = msg;

if (!ready) {
  $("setup-warning").classList.remove("hidden");
  $("setup-warning").textContent = "Setup needed: create a Supabase project, run the SQL from README-SETUP.txt, then add your Project URL and anon key to config.js.";
}
$("login-form").addEventListener("submit", async e => {
  e.preventDefault(); if (!db) return say("login-message","Finish the Supabase setup first.");
  say("login-message","Signing in…");
  const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});
  if(error) return say("login-message",error.message);
  await checkSession();
});
$("logout").onclick=async()=>{await db.auth.signOut(); showLoggedOut()};
async function checkSession() {
  if(!db) return;
  const {data}=await db.auth.getSession();
  if(data.session) { $("login-card").classList.add("hidden"); $("dashboard").classList.remove("hidden"); await loadAdminProducts(); }
  else showLoggedOut();
}
function showLoggedOut(){ $("dashboard").classList.add("hidden"); $("login-card").classList.remove("hidden"); }
$("p-image").addEventListener("change",()=>{
  const file=$("p-image").files[0]; if(!file)return;
  if(file.size>5*1024*1024){say("product-message","Image must be under 5 MB.");$("p-image").value="";return;}
  if(!file.type.startsWith("image/")){say("product-message","Choose an image file.");$("p-image").value="";return;}
  $("image-preview").src=URL.createObjectURL(file); $("image-preview").classList.remove("hidden");
});
function resetForm(){
  editingId=null; currentImage=null; $("product-form").reset(); $("p-stock").value=10;
  $("image-preview").classList.add("hidden"); $("image-preview").removeAttribute("src");
  $("form-title").textContent="Add a product"; $("save-product").textContent="SAVE PRODUCT"; say("product-message","");
}
$("cancel-edit").onclick=resetForm;
$("product-form").addEventListener("submit",async e=>{
  e.preventDefault(); if(!db)return;
  const name=$("p-name").value.trim(), price=Number($("p-price").value), compare=Number($("p-compare").value||0), stock=Number($("p-stock").value);
  if(!name || price<0 || stock<0)return say("product-message","Check the product details.");
  $("save-product").disabled=true; say("product-message","Saving product…");
  let imageUrl=currentImage;
  const file=$("p-image").files[0];
  if(file){
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
    const path=`${crypto.randomUUID()}.${ext}`;
    const {error:uploadError}=await db.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});
    if(uploadError){$("save-product").disabled=false;return say("product-message","Photo upload failed: "+uploadError.message);}
    const {data}=db.storage.from("product-images").getPublicUrl(path); imageUrl=data.publicUrl;
  }
  if(!imageUrl){$("save-product").disabled=false;return say("product-message","Please upload a product photo.");}
  const row={name,price,compare_price:compare,category:$("p-category").value,stock,description:$("p-description").value.trim(),image_url:imageUrl};
  const result=editingId ? await db.from("products").update(row).eq("id",editingId) : await db.from("products").insert(row);
  $("save-product").disabled=false;
  if(result.error)return say("product-message","Save failed: "+result.error.message);
  resetForm(); say("product-message","Product saved."); await loadAdminProducts();
});
async function loadAdminProducts(){
  const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});
  if(error){$("admin-products").innerHTML=`<p class="muted">${error.message}</p>`;return;}
  $("product-count").textContent=`${data.length} products`;
  $("admin-products").innerHTML=data.length?data.map(p=>`
    <div class="admin-product">
      <img src="${escapeHtml(p.image_url)}" alt="">
      <div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} · ${money(p.price)}</p><p>Stock: ${p.stock}</p></div>
      <div class="admin-actions"><button class="outline-btn" data-edit="${p.id}">EDIT</button><button class="danger" data-delete="${p.id}">DELETE</button></div>
    </div>`).join(""):'<div class="empty">No products yet. Add your first product.</div>';
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editProduct(b.dataset.edit,data));
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteProduct(b.dataset.delete));
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function editProduct(id,data){
  const p=data.find(x=>x.id===id); if(!p)return;
  editingId=p.id;currentImage=p.image_url;
  $("p-name").value=p.name;$("p-price").value=p.price;$("p-compare").value=p.compare_price||"";
  $("p-category").value=p.category;$("p-stock").value=p.stock;$("p-description").value=p.description||"";
  $("image-preview").src=p.image_url;$("image-preview").classList.remove("hidden");
  $("form-title").textContent="Edit product";$("save-product").textContent="UPDATE PRODUCT";
  say("product-message","Leave photo empty to keep the existing image.");
  window.scrollTo({top:0,behavior:"smooth"});
}
async function deleteProduct(id){
  if(!confirm("Delete this product from the store?"))return;
  const {error}=await db.from("products").delete().eq("id",id);
  if(error)alert("Delete failed: "+error.message);else await loadAdminProducts();
}
if(db)db.auth.onAuthStateChange(()=>checkSession());
checkSession();
