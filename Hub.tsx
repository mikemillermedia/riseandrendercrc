{/* ASSET VAULT TAB */}
{activeTab === 'vault' && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
    <div className="text-center mb-8 md:mb-12">
      <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3 inline-block">
        Digital Resources
      </span>
      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
        Asset <span className="text-[#ff4d00]">Vault</span>
      </h1>
      <p className="text-white/50 text-xs md:text-sm max-w-lg mx-auto">
        Exclusive guides, templates, and creator tools engineered for high-end content production.
      </p>
    </div>

    {/* FEATURED: CREATOR KIT GUIDE WITH 3D BOX MOCKUP */}
    <div className="bg-[#131313] border border-[#ff4d00]/30 rounded-3xl p-6 md:p-10 mb-10 relative overflow-hidden shadow-[0_0_40px_rgba(255,77,0,0.12)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/10 rounded-full blur-[110px] pointer-events-none" />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* 3D SOFTWARE BOX MOCKUP */}
        <div className="md:col-span-5 flex justify-center items-center py-4">
          <div className="relative group perspective-[1000px] cursor-pointer">
            
            {/* Ambient Back Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ff4d00] to-orange-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />

            {/* 3D Box Container */}
            <div className="relative w-48 sm:w-56 h-72 sm:h-80 transition-transform duration-500 ease-out transform transform-3d rotate-y-[-18deg] rotate-x-[8deg] group-hover:rotate-y-[-8deg] group-hover:rotate-x-[4deg]">
              
              {/* Box Front Face */}
              <div className="absolute inset-0 bg-[#111] rounded-r-md overflow-hidden border border-white/20 shadow-2xl z-10">
                <img 
                  src="/creator-kit-cover.jpg" // Ensure your cover image is in /public/creator-kit-cover.jpg
                  alt="The Content Creator Studio Kit Cover" 
                  className="w-full h-full object-cover"
                />
                {/* Metallic Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
              </div>

              {/* Box Spine (Left Edge Side) */}
              <div className="absolute top-0 left-0 w-6 h-full bg-[#0a0a0a] border-l border-y border-white/20 origin-left transform -rotate-y-90 translate-x-[-24px] flex flex-col justify-between py-6 px-1 text-center shadow-inner z-0">
                <span className="text-[8px] font-black tracking-widest text-[#ff4d00] uppercase rotate-180 write-vertical">RISE + RENDER</span>
                <span className="text-[9px] font-bold tracking-wider text-white/80 uppercase rotate-180 write-vertical truncate">CREATOR STUDIO KIT</span>
                <div className="w-2 h-2 rounded-full bg-[#ff4d00] mx-auto" />
              </div>

              {/* Box Top Edge */}
              <div className="absolute top-0 left-0 w-full h-6 bg-[#222] border-t border-x border-white/20 origin-top transform rotate-x-90 translate-y-[-24px] z-0" />

              {/* Box Drop Shadow */}
              <div className="absolute -bottom-6 left-2 right-2 h-6 bg-black/80 blur-md rounded-full transform rotate-x-60 scale-95 group-hover:scale-105 group-hover:blur-lg transition-all" />
            </div>
          </div>
        </div>

        {/* DETAILS & ACTION BUTTON */}
        <div className="md:col-span-7 space-y-4 text-left">
          <div className="flex items-center gap-2 text-[#ff4d00] text-xs font-bold uppercase tracking-widest">
            <Sparkles size={16} /> Official Digital Guide
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight leading-tight">
            The Content Creator Studio Kit
          </h2>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
            A proven, no-guesswork at-home studio setup for small business owners and entrepreneurs who want their podcast to look and sound professional without overcomplicating the process.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a 
              href="https://your-custom-link.com" // <-- Replace with your actual URL link
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,77,0,0.35)] transition-all"
            >
              <BookOpen size={16} /> Open Guide
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>
)}
