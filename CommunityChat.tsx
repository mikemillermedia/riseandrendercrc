import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, MessageCircle, Send, MoreHorizontal, User, ImageIcon, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CommunityChat({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  
  // New states for handling media attachments
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (first_name, last_name, instagram_url, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  // Handle selecting an image or video
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file)); // Creates a local preview instantly
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow posting if there is text OR a media file
    if (!newPost.trim() && !mediaFile) return; 
    setPosting(true);

    let media_url = null;

    // 1. If they attached a file, upload it to the cloud drive first
    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `chat_${user.id}_${Math.random()}.${fileExt}`;
      
      // We can safely reuse the 'setups' bucket we built earlier!
      const { error: uploadError } = await supabase.storage.from('setups').upload(fileName, mediaFile);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(fileName);
        media_url = publicUrl;
      }
    }

    // 2. Save the post (with the text and the new media URL) to the database
    const { error } = await supabase.from('posts').insert([
      { user_id: user.id, content: newPost.trim(), media_url: media_url }
    ]);

    if (!error) {
      setNewPost('');
      removeMedia();
      fetchPosts(); // Refresh feed instantly
    }
    setPosting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Helper to determine if the URL is a video file so we can render a video player instead of an image
  const isVideo = (url: string) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Community Chat</h1>
      <p className="text-[#F5F5F0]/60 mb-8">Connect, collaborate, and share with the CRC family.</p>

      {/* Threads-style Input Box */}
      <div className="bg-[#131313] border border-[#F5F5F0]/10 p-4 md:p-6 rounded-2xl shadow-xl mb-8">
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0 border border-[#F5F5F0]/10 flex items-center justify-center overflow-hidden">
            <User size={20} className="text-[#F5F5F0]/40" />
          </div>
          <div className="flex-grow flex flex-col">
            <input 
              type="text"
              placeholder="Start a thread or share an image..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full bg-transparent border-none text-[#F5F5F0] placeholder:text-[#F5F5F0]/40 focus:outline-none focus:ring-0 text-base md:text-lg pt-1.5"
            />
            
            {/* Attachment Preview Area */}
            {mediaPreview && (
              <div className="mt-4 relative inline-block w-fit">
                <button 
                  type="button" 
                  onClick={removeMedia}
                  className="absolute -top-2 -right-2 bg-[#131313] border border-[#F5F5F0]/20 text-white rounded-full p-1 hover:bg-[#ff4d00] transition-colors z-10"
                >
                  <X size={14} />
                </button>
                {mediaFile?.type.startsWith('video/') ? (
                  <video src={mediaPreview} className="max-h-64 rounded-xl border border-[#F5F5F0]/10" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="max-h-64 rounded-xl border border-[#F5F5F0]/10 object-contain" />
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              
              {/* Media Upload Button */}
              <label className="text-[#F5F5F0]/40 hover:text-[#ff4d00] cursor-pointer p-2 -ml-2 rounded-full hover:bg-[#ff4d00]/10 transition-colors" title="Attach Image or Video">
                <ImageIcon size={20} />
                <input type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
              </label>
              
              <button 
                type="submit" 
                disabled={posting || (!newPost.trim() && !mediaFile)}
                className="bg-[#F5F5F0] text-[#131313] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white font-bold py-1.5 px-5 rounded-full text-sm transition-colors"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* The Feed */}
      <div className="space-y-0">
        {loading ? (
           <div className="text-[#F5F5F0]/60 animate-pulse text-center py-12">Loading threads...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="flex gap-3 md:gap-4 py-5 border-b border-[#F5F5F0]/10 hover:bg-white/[0.02] px-2 transition-colors -mx-2 rounded-xl">
              
              {/* Avatar Column */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0 border border-[#F5F5F0]/10 flex items-center justify-center overflow-hidden">
                  {post.profiles?.avatar_url ? (
                     <img src={post.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-[#F5F5F0]/40" />
                  )}
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-grow min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm md:text-base leading-none">
                      {post.profiles?.first_name || 'CRC'} {post.profiles?.last_name || 'Member'}
                    </h3>
                    {post.profiles?.instagram_url && (
                       <span className="text-xs text-[#F5F5F0]/40 hidden md:inline">
                         @{post.profiles.instagram_url.split('/').filter(Boolean).pop()}
                       </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[#F5F5F0]/40 text-xs">
                    <span>{formatDate(post.created_at)}</span>
                    <button className="hover:text-white transition-colors"><MoreHorizontal size={16} /></button>
                  </div>
                </div>

                {post.content && (
                  <p className="text-[#F5F5F0]/90 text-sm md:text-base mt-1 whitespace-pre-wrap break-words leading-relaxed">
                    {post.content}
                  </p>
                )}

                {/* Render Attached Media (Image or Video) */}
                {post.media_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-[#F5F5F0]/10 w-fit max-w-full">
                    {isVideo(post.media_url) ? (
                      <video src={post.media_url} controls className="max-h-96 w-full object-contain bg-black" />
                    ) : (
                      <img src={post.media_url} alt="Attachment" className="max-h-96 w-full object-contain" />
                    )}
                  </div>
                )}

                {/* Threads Action Icons */}
                <div className="flex gap-5 mt-3 text-[#F5F5F0]/40">
                  <button className="hover:text-[#ff4d00] hover:bg-[#ff4d00]/10 p-1.5 rounded-full transition-all"><Heart size={18} /></button>
                  <button className="hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"><MessageCircle size={18} /></button>
                  <button className="hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"><Send size={18} /></button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="text-[#F5F5F0]/60 border border-dashed border-[#F5F5F0]/20 p-12 rounded-2xl text-center">
            No threads yet. Be the first to start a conversation!
          </div>
        )}
      </div>
    </div>
  );
}
