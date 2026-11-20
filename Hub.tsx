  // FETCH LIVE DATA
  const fetchCommunityData = async () => {
    if (!supabase) return;
    try {
      // 1. Fetch raw posts, likes, and replies without the nested profile join
      const { data: pData, error: pError } = await supabase
        .from('community_posts')
        .select(`*, post_likes(user_id), post_replies(*)`)
        .order('created_at', { ascending: false });
        
      const { data: prData, error: prError } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Log errors to the console if they still happen so we can see them
      if (pError) console.error("Error fetching posts:", pError.message);
      if (prError) console.error("Error fetching prayers:", prError.message);
      
      if (pData || prData) {
        // 2. Collect ALL unique user IDs from posts, prayers, AND replies
        const userIds = new Set<string>();

        (pData || []).forEach((p: any) => {
          userIds.add(p.user_id);
          (p.post_replies || []).forEach((r: any) => userIds.add(r.user_id));
        });
        (prData || []).forEach((p: any) => userIds.add(p.user_id));

        // 3. Fetch all needed profiles in one go
        const { data: profData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, bio, bible_verse')
          .in('id', Array.from(userIds));

        const profileMap = (profData || []).reduce((acc: any, curr: any) => {
          acc[curr.id] = curr;
          return acc;
        }, {});

        // 4. Manually stitch the profiles into the posts and replies
        if (pData) {
          setPosts(pData.map((p: any) => ({
            ...p,
            profile: profileMap[p.user_id],
            likes: p.post_likes || [],
            replies: (p.post_replies || [])
              .map((r: any) => ({ ...r, profiles: profileMap[r.user_id] }))
              .sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          })));
        }
        if (prData) {
          setPrayers(prData.map((p: any) => ({ 
            ...p, 
            profile: profileMap[p.user_id] 
          })));
        }
      }
    } catch (err) {
      console.error("Error fetching community data:", err);
    }
  };