// ADD THIS STATE TO AdminDashboard.tsx
const [deliverLink, setDeliverLink] = useState('');
const [deliverTitle, setDeliverTitle] = useState('');
const [deliverType, setDeliverType] = useState('Horizontal Podcast');
const [isDelivering, setIsDelivering] = useState(false);

// ADD THIS FUNCTION TO AdminDashboard.tsx
const handleDeliverAsset = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedClient || !deliverLink.trim() || !deliverTitle.trim()) return;
  
  setIsDelivering(true);
  try {
    await supabase.from('retainer_assets').insert([{
      user_id: selectedClient.id,
      title: deliverTitle,
      asset_type: deliverType,
      download_url: deliverLink,
      file_size: "Link"
    }]);
    
    // Clear form on success
    setDeliverTitle('');
    setDeliverLink('');
    alert("Asset Delivered Successfully!");
  } catch (error) {
    console.error("Error delivering asset:", error);
  } finally {
    setIsDelivering(false);
  }
};

// ADD THIS UI BLOCK TO AdminDashboard.tsx (inside the selected client view)
<div className="bg-[#131313] border border-white/5 rounded-2xl p-6 mt-6">
  <h3 className="text-white font-black uppercase tracking-widest mb-4">Deliver Final Asset</h3>
  <form onSubmit={handleDeliverAsset} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-white/50 uppercase mb-2">Asset Title</label>
        <input 
          type="text" 
          value={deliverTitle} 
          onChange={(e) => setDeliverTitle(e.target.value)} 
          placeholder="e.g. EP 30 Final Folder" 
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white" 
          required 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-white/50 uppercase mb-2">Asset Type</label>
        <select 
          value={deliverType} 
          onChange={(e) => setDeliverType(e.target.value)} 
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none"
        >
          <option value="Horizontal Podcast">Horizontal Podcast</option>
          <option value="Vertical Reel">Vertical Reel / Short</option>
          <option value="Other">Other Media</option>
        </select>
      </div>
    </div>
    <div>
      <label className="block text-xs font-bold text-white/50 uppercase mb-2">Folder / Download Link</label>
      <input 
        type="url" 
        value={deliverLink} 
        onChange={(e) => setDeliverLink(e.target.value)} 
        placeholder="https://drive.google.com/..." 
        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white" 
        required 
      />
    </div>
    <button 
      type="submit" 
      disabled={isDelivering} 
      className="bg-green-500 text-black font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-green-400 transition-all text-sm w-full md:w-auto"
    >
      {isDelivering ? 'Pushing to Client...' : 'Deliver to Asset Vault'}
    </button>
  </form>
</div>
);
};

export default AdminDashboard;
