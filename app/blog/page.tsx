'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CalendarDays, 
  Clock, 
  User, 
  Tag, 
  MessageSquare, 
  ArrowRight, 
  BookOpen,
  TrendingUp,
  Heart,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Firebase imports
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types Definition for Blog
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  readTime: string;
  publishedDate: string;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  imageUrl: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const postsPerPage = 6;

  // Fetch blogs from Firebase
  const fetchBlogs = async () => {
    try {
      const blogsRef = collection(db, 'blogs');
      const q = query(blogsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const blogsData: BlogPost[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        blogsData.push({
          id: doc.id,
          title: data.title || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          author: {
            name: data.author?.name || 'Admin',
            role: data.author?.role || 'Author',
            avatar: data.author?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop'
          },
          category: data.category || 'Uncategorized',
          tags: Array.isArray(data.tags) ? data.tags : [],
          readTime: data.readTime || '5 min read',
          publishedDate: data.publishedDate || new Date().toISOString().split('T')[0],
          views: Number(data.views) || 0,
          likes: Number(data.likes) || 0,
          comments: Number(data.comments) || 0,
          featured: Boolean(data.featured) || false,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop'
        });
      });
      
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Get unique categories from blogs
  const blogCategories = [
    { id: 'all', name: 'All Articles', count: blogs.length },
    ...Array.from(new Set(blogs.map(p => p.category)))
      .filter((category): category is string => Boolean(category && category.trim() !== ''))
      .map(category => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
        count: blogs.filter(p => p.category === category).length
      }))
  ];

  // Get all tags from blogs for popular tags
  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));
  const popularTags = allTags.slice(0, 15); // Show first 15 tags

  // Filter blog posts
  const filteredPosts = blogs.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
      post.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Featured posts
  const featuredPosts = blogs.filter(post => post.featured);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Handle like
  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  // Handle bookmark
  const handleBookmark = (postId: string) => {
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    if (newBookmarkedPosts.has(postId)) {
      newBookmarkedPosts.delete(postId);
    } else {
      newBookmarkedPosts.add(postId);
    }
    setBookmarkedPosts(newBookmarkedPosts);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />

      {/* Premium Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary blur-[120px] animate-pulse"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full mb-6 border border-secondary/30">
            <BookOpen className="w-4 h-4 text-secondary" />
            <span className="text-secondary font-black tracking-[0.3em] uppercase text-[10px]">The ManofCave Journal</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            The Grooming <span className="text-secondary italic">Chronicles</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg font-light leading-relaxed mb-8">
            Expert insights, style guides, and timeless wisdom for the modern gentleman's journey to excellence.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Total Articles</p>
                  <p className="text-2xl font-bold text-white">{blogs.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Total Comments</p>
                  <p className="text-2xl font-bold text-white">
                    {blogs.reduce((sum, post) => sum + post.comments, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Total Views</p>
                  <p className="text-2xl font-bold text-white">
                    {blogs.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className=" top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
              <Input 
                placeholder="Search articles by title, content, or tags..." 
                className="pl-11 rounded-2xl border-gray-200 bg-white/80 text-sm h-12 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {blogCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "whitespace-nowrap px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border rounded-2xl min-w-[120px] text-center",
                    selectedCategory === cat.id 
                      ? "bg-primary text-white border-primary shadow-xl scale-[1.02]" 
                      : "bg-white text-primary border-gray-200 hover:border-secondary hover:text-secondary hover:shadow-md"
                  )}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags Section */}
          {popularTags.length > 0 && (
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-3 border-t border-gray-100">
              <div className="flex items-center gap-2 shrink-0">
                <Tag className="w-4 h-4 text-secondary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Popular Topics:</span>
              </div>
              
              <div className="flex items-center gap-3">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border",
                      searchQuery === tag
                        ? "bg-secondary/20 text-secondary border-secondary/40 shadow-sm" 
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Featured Posts */}
          {selectedCategory === 'all' && featuredPosts.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-primary">
                    Featured Articles
                    <span className="text-secondary ml-2">({featuredPosts.length})</span>
                  </h2>
                  <p className="text-gray-600 mt-2">Curated selection of our most popular and insightful articles</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-600">Editor's Picks</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post) => (
                  <Card key={post.id} className="group overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[2.5rem]">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <Badge className="absolute top-4 left-4 bg-secondary border-none px-3 py-1.5 text-[10px] font-black tracking-widest">
                        FEATURED
                      </Badge>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-white/90 backdrop-blur-sm text-primary border-none px-3 py-1.5 text-[10px] font-black">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{post.publishedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{post.readTime}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-serif font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-2">{post.excerpt}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            <img 
                              src={post.author.avatar} 
                              alt={post.author.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-primary">{post.author.name}</p>
                            <p className="text-xs text-gray-500">{post.author.role}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={cn(
                              "flex items-center gap-2 text-sm transition-colors",
                              likedPosts.has(post.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                            )}
                          >
                            <Heart className={cn(
                              "w-5 h-5 transition-all",
                              likedPosts.has(post.id) && "fill-current"
                            )} />
                            <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                          </button>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MessageSquare className="w-5 h-5" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-8 pb-8 pt-0">
                      <Button 
                        className="w-full rounded-2xl bg-primary hover:bg-secondary hover:text-primary font-black tracking-[0.2em] text-[10px] h-12"
                        onClick={() => router.push(`/blog/${post.id}`)}
                      >
                        READ FULL ARTICLE <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Articles Header */}
          <div className="mb-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary">
                All Articles
                <span className="text-secondary ml-2">({filteredPosts.length})</span>
              </h2>
              <p className="text-gray-600 mt-2">
                Browse our complete collection of grooming wisdom and insights
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/20 border-none">
                <TrendingUp className="w-3 h-3 mr-2" />
                {blogs.reduce((sum, post) => sum + post.views, 0).toLocaleString()} Total Views
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                <MessageSquare className="w-3 h-3 mr-2" />
                {blogs.reduce((sum, post) => sum + post.comments, 0)} Comments
              </Badge>
            </div>
          </div>

          {/* Blog Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-primary mb-3">No Articles Found</h3>
              <p className="text-gray-500 font-light mb-8 max-w-md mx-auto">
                {blogs.length === 0 
                  ? 'No blogs available. Check back soon for new articles!'
                  : 'No articles match your current filters. Try adjusting your search criteria or select a different category.'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory('all'); 
                  setSearchQuery(''); 
                  setCurrentPage(1);
                }}
                className="rounded-full px-8 border-secondary text-secondary hover:bg-secondary hover:text-primary font-bold tracking-widest text-[10px]"
              >
                <Filter className="w-4 h-4 mr-2" />
                CLEAR ALL FILTERS
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <Card key={post.id} className="group overflow-hidden border-2 border-gray-100 hover:border-secondary/20 transition-all duration-500 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                    {/* Post Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-sm text-primary border-none px-3 py-1.5 text-[10px] font-black tracking-widest">
                          {post.category}
                        </Badge>
                      </div>
                      
                      {/* Bookmark Button */}
                      <button 
                        onClick={() => handleBookmark(post.id)}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Bookmark className={cn(
                          "w-5 h-5 transition-all",
                          bookmarkedPosts.has(post.id) ? "fill-current text-secondary" : "text-gray-400"
                        )} />
                      </button>
                    </div>
                    
                    <CardContent className="p-6">
                      {/* Post Metadata */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{post.publishedDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Post Title */}
                      <h3 className="text-xl font-serif font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2 h-14">
                        {post.title}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm font-light mb-4 line-clamp-2 min-h-[40px]">
                        {post.excerpt}
                      </p>
                      
                      {/* Author */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={post.author.avatar} 
                            alt={post.author.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{post.author.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{post.author.role}</p>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge 
                            key={tag}
                            variant="outline"
                            className="text-[10px] py-1 px-3 text-gray-600 border-gray-200"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Badge variant="outline" className="text-[10px] py-1 px-3 text-gray-400 border-gray-200">
                            +{post.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Interaction Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={cn(
                              "flex items-center gap-2 text-xs transition-colors",
                              likedPosts.has(post.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                            )}
                          >
                            <Heart className={cn(
                              "w-4 h-4 transition-all",
                              likedPosts.has(post.id) && "fill-current"
                            )} />
                            <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                          </button>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-secondary hover:text-primary hover:bg-secondary/10"
                          onClick={() => router.push(`/blog/${post.id}`)}
                        >
                          Read More <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-full w-10 h-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "rounded-full w-10 h-10 font-bold",
                          currentPage === pageNum && "bg-primary text-white"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-full w-10 h-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Blog Stats */}
          {blogs.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Articles */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Articles</p>
                      <p className="text-2xl font-bold text-primary">{blogs.length}</p>
                    </div>
                  </div>
                </div>
                
                {/* Total Authors */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expert Authors</p>
                      <p className="text-2xl font-bold text-secondary">
                        {new Set(blogs.map(p => p.author.name)).size}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Total Views */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p className="text-2xl font-bold text-green-600">
                        {blogs.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Total Engagement */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Engagement</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {blogs.reduce((sum, p) => sum + p.likes + p.comments, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-primary/90">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white font-black tracking-[0.3em] uppercase text-[10px]">Stay Informed</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-white mb-6">
            Join The Gentleman's Newsletter
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg mb-8">
            Get weekly grooming tips, style insights, and exclusive content delivered to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              placeholder="Enter your email address" 
              className="flex-1 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <Button className="rounded-2xl bg-white text-primary hover:bg-white/90 font-black tracking-[0.2em] text-[10px] px-8 py-6">
              SUBSCRIBE NOW
            </Button>
          </div>
          
          <p className="text-white/60 text-sm mt-4">
            Join 15,000+ gentlemen who receive our weekly insights
          </p>
        </div>
      </section>
    </div>
  );
}

// Eye icon component
function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}