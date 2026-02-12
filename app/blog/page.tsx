'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { Footer } from "@/components/shared/Footer";
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
  const popularTags = allTags.slice(0, 15);

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
    <div className="min-h-screen bg-gray-400 flex flex-col ">
      <Header />
      <main className="flex-1 pt-18">
        {/* Premium Hero Section - CODE1 STYLE */}
        <section className="
        relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-32 px-4 overflow-hidden
        
        ">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center space-y-8">
               <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium">
              <Tag className="w-4 h-4" />
              Beauty Insights & Tips
            </div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-gray-400 bg-clip-text text-">
              Beauty Blog
            </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                Discover expert beauty advice, trending tips, and insider knowledge from JAM Beauty Lounge's
              professional team. Your journey to radiant beauty starts here.
              </p>
              
              {/* Stats - CODE1 STYLE */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Articles</p>
                      <p className="text-2xl font-bold text-primary">{blogs.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Comments</p>
                      <p className="text-2xl font-bold text-primary">
                        {blogs.reduce((sum, post) => sum + post.comments, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Views</p>
                      <p className="text-2xl font-bold text-primary">
                        {blogs.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section - CODE1 STYLE */}
        <section className="py-16 px-4 border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search articles by title, content, or tags..."
                  className="pl-12 pr-4 py-3 border-gray-200 rounded-2xl focus:border-primary focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Categories - CODE1 STYLE */}
              <div className="flex flex-wrap gap-3">
                {blogCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                      selectedCategory === cat.id
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Tags Section - CODE1 STYLE */}
            {popularTags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 shrink-0">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-gray-600">Popular Topics:</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className={cn(
                          "px-4 py-2 text-xs font-medium rounded-full transition-all border",
                          searchQuery === tag
                            ? "bg-secondary/20 text-secondary border-secondary/40"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                        )}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Featured Posts - CODE1 STYLE */}
            {selectedCategory === 'all' && featuredPosts.length > 0 && (
              <div className="mb-20">
                <div className="mb-12">
                  <h2 className="text-3xl font-serif font-bold text-primary mb-4">
                    Featured Articles
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-primary rounded-full"></div>
                 
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <Card key={post.id} className="group bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-500">
                      <div className="grid md:grid-cols-2 gap-0 h-full">
                        <div className="relative h-64 md:h-auto overflow-hidden">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gray-400  text-white px-4 py-2 rounded-full text-sm font-medium">
                              FEATURED
                            </Badge>
                          </div>
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {post.author.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                {post.publishedDate}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                              </div>
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-primary leading-tight group-hover:text-secondary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {post.excerpt}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {post.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="gray-400" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            <Button 
                              className="w-fit bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-2xl font-medium group/btn"
                              onClick={() => router.push(`/blog/${post.id}`)}
                            >
                              Read Full Article
                              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Articles Header - CODE1 STYLE */}
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">
                All Articles
                <span className="text-gray-800 ml-2">({filteredPosts.length})</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <p className="text-gray-600 mt-4">
                Browse our complete collection of grooming wisdom and insights
              </p>
            </div>

            {/* Blog Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
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
                  className="rounded-full px-8 border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-bold tracking-widest text-xs"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  CLEAR ALL FILTERS
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedPosts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full"
                    >
                      {/* Post Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';
                          }}
                        />
                        
                        {/* Category Badge - CODE1 STYLE */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                            {post.category}
                          </Badge>
                        </div>
                        
                        {/* Bookmark Button */}
                        <button 
                          onClick={() => handleBookmark(post.id)}
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Bookmark className={cn(
                            "w-4 h-4 transition-all",
                            bookmarkedPosts.has(post.id) ? "fill-current text-secondary" : "text-gray-400"
                          )} />
                        </button>
                      </div>
                      
                      <CardContent className="p-6 space-y-4">
                        {/* Post Metadata - CODE1 STYLE */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(post.publishedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </div>
                        </div>
                        
                        {/* Post Title - CODE1 STYLE */}
                        <h3 className="text-xl font-serif font-bold text-primary leading-tight line-clamp-2 group-hover:text-secondary transition-colors min-h-14">
                          {post.title}
                        </h3>
                        
                        {/* Excerpt - CODE1 STYLE */}
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                          {post.excerpt}
                        </p>
                        
                        {/* Tags - CODE1 STYLE */}
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-gray-200 text-gray-600">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Interaction Stats */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={cn(
                                "flex items-center gap-1 text-xs transition-colors",
                                likedPosts.has(post.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                              )}
                            >
                              <Heart className={cn(
                                "w-4 h-4 transition-all",
                                likedPosts.has(post.id) && "fill-current"
                              )} />
                              <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                            </button>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.comments}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>{post.views.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Read More Button - CODE1 STYLE */}
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-primary hover:text-secondary hover:bg-secondary/5 p-0 h-auto font-medium group/btn mt-2"
                          onClick={() => router.push(`/blog/${post.id}`)}
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination - CODE1 STYLE */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-full w-10 h-10 border-gray-200"
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
                            currentPage === pageNum 
                              ? "bg-primary text-white" 
                              : "border-gray-200 text-primary hover:border-secondary hover:text-secondary"
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
                      className="rounded-full w-10 h-10 border-gray-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Blog Stats - CODE1 STYLE */}
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

         {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-500 to-gray-600 ">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-bold">Stay Beautiful</h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Subscribe to our newsletter for exclusive beauty tips, early access to new treatments,
              and special offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl px-6 py-4"
              />
              <Button className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-2xl font-medium whitespace-nowrap">
                Subscribe Now
              </Button>
            </div>
            <p className="text-sm opacity-75">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </section>
      
      </main>
      <Footer/>
    </div>
  );
}