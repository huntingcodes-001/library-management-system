import { supabase } from './supabase';
import { addDays } from 'date-fns';

export const api = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  // Books
  async getBooks(categoryId?: string) {
    let query = supabase
      .from('books')
      .select(`
        *,
        categories (
          id,
          name,
          description
        )
      `)
      .order('title');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async searchBooks(searchTerm: string) {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        categories (
          id,
          name,
          description
        )
      `)
      .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('title');

    if (error) throw error;
    return data;
  },

  async getBookById(id: string) {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        categories (
          id,
          name,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addBook(bookData: {
    title: string;
    author: string;
    category_id: string;
    total_quantity: number;
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('books')
      .insert({
        ...bookData,
        available_quantity: bookData.total_quantity,
      })
      .select()
      .single();

    if (error) throw error;

    // Create book copies
    const copies = Array.from({ length: bookData.total_quantity }, (_, i) => ({
      book_id: data.id,
      copy_number: `${bookData.title.substring(0, 3).toUpperCase()}-${Date.now()}-${i + 1}`,
    }));

    const { error: copiesError } = await supabase
      .from('book_copies')
      .insert(copies);

    if (copiesError) throw copiesError;

    return data;
  },

  // Issue Requests
  async createIssueRequest(bookId: string) {
    const { data, error } = await supabase
      .from('issue_requests')
      .insert({
        book_id: bookId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getIssueRequests(status?: string) {
    let query = supabase
      .from('issue_requests')
      .select(`
        *,
        books (
          id,
          title,
          author
        ),
        profiles (
          id,
          full_name,
          student_id
        )
      `)
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateIssueRequest(id: string, status: 'approved' | 'rejected', notes?: string) {
    const { data, error } = await supabase
      .from('issue_requests')
      .update({
        status,
        notes,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, create book issue
    if (status === 'approved') {
      await this.createBookIssue(data.user_id, data.book_id);
    }

    return data;
  },

  // Book Issues
  async createBookIssue(userId: string, bookId: string) {
    // Find available book copy
    const { data: availableCopy, error: copyError } = await supabase
      .from('book_copies')
      .select('*')
      .eq('book_id', bookId)
      .eq('status', 'available')
      .limit(1)
      .single();

    if (copyError || !availableCopy) {
      throw new Error('No available copies');
    }

    // Create book issue
    const dueDate = addDays(new Date(), 14); // 2 weeks loan period
    const { data, error } = await supabase
      .from('book_issues')
      .insert({
        user_id: userId,
        book_id: bookId,
        book_copy_id: availableCopy.id,
        due_date: dueDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update book copy status
    await supabase
      .from('book_copies')
      .update({ status: 'issued' })
      .eq('id', availableCopy.id);

    // Update book available quantity
    await supabase.rpc('decrement_available_quantity', { book_id: bookId });

    return data;
  },

  async getUserBookIssues(userId: string) {
    const { data, error } = await supabase
      .from('book_issues')
      .select(`
        *,
        books (
          id,
          title,
          author,
          cover_url
        ),
        book_copies (
          copy_number
        )
      `)
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllBookIssues() {
    const { data, error } = await supabase
      .from('book_issues')
      .select(`
        *,
        books (
          id,
          title,
          author
        ),
        profiles (
          id,
          full_name,
          student_id
        ),
        book_copies (
          copy_number
        )
      `)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async returnBook(issueId: string) {
    const { data, error } = await supabase
      .from('book_issues')
      .update({
        returned_at: new Date().toISOString(),
      })
      .eq('id', issueId)
      .select()
      .single();

    if (error) throw error;

    // Update book copy status
    await supabase
      .from('book_copies')
      .update({ status: 'available' })
      .eq('id', data.book_copy_id);

    // Update book available quantity
    await supabase.rpc('increment_available_quantity', { book_id: data.book_id });

    return data;
  },

  // Book Addition Requests
  async createBookAdditionRequest(requestData: {
    book_title: string;
    author?: string;
    reference_link?: string;
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('book_addition_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBookAdditionRequests(status?: string) {
    let query = supabase
      .from('book_addition_requests')
      .select(`
        *,
        profiles (
          id,
          full_name,
          student_id
        )
      `)
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateBookAdditionRequest(id: string, status: 'approved' | 'rejected', notes?: string) {
    const { data, error } = await supabase
      .from('book_addition_requests')
      .update({
        status,
        notes,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reviews and Summaries
  async createReviewSummary(reviewData: {
    book_id: string;
    type: 'review' | 'summary';
    title: string;
    content: string;
    rating?: number;
  }) {
    const { data, error } = await supabase
      .from('reviews_summaries')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getReviewsSummaries(status?: string, userId?: string) {
    let query = supabase
      .from('reviews_summaries')
      .select(`
        *,
        books (
          id,
          title,
          author
        ),
        profiles (
          id,
          full_name,
          student_id
        )
      `)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateReviewSummary(id: string, status: 'approved' | 'rejected') {
    const { data: reviewSummary, error: fetchError } = await supabase
      .from('reviews_summaries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const coinsEarned = status === 'approved' ? (reviewSummary.type === 'review' ? 5 : 15) : 0;

    const { data, error } = await supabase
      .from('reviews_summaries')
      .update({
        status,
        coins_earned: coinsEarned,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, add coins to user and create transaction
    if (status === 'approved' && coinsEarned > 0) {
      await this.addCoins(reviewSummary.user_id, coinsEarned, `${reviewSummary.type} approved`, id);
    }

    return data;
  },

  // Coin System
  async addCoins(userId: string, amount: number, reason: string, referenceId?: string) {
    // Add transaction
    const { error: transactionError } = await supabase
      .from('coin_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'earned',
        reason,
        reference_id: referenceId,
      });

    if (transactionError) throw transactionError;

    // Update user balance
    const { error: updateError } = await supabase.rpc('update_coin_balance', {
      user_id: userId,
      amount_change: amount,
    });

    if (updateError) throw updateError;
  },

  async deductCoins(userId: string, amount: number, reason: string, referenceId?: string) {
    // Add transaction
    const { error: transactionError } = await supabase
      .from('coin_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'deducted',
        reason,
        reference_id: referenceId,
      });

    if (transactionError) throw transactionError;

    // Update user balance
    const { error: updateError } = await supabase.rpc('update_coin_balance', {
      user_id: userId,
      amount_change: -amount,
    });

    if (updateError) throw updateError;
  },

  async getCoinTransactions(userId: string) {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Analytics
  async getDashboardStats(userId: string) {
    const [
      { count: totalIssued },
      { count: totalReviews },
      { data: coinTransactions },
      { data: profile },
    ] = await Promise.all([
      supabase
        .from('book_issues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('reviews_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('coin_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'earned'),
      supabase
        .from('profiles')
        .select('coin_balance')
        .eq('user_id', userId)
        .single(),
    ]);

    const totalCoinsEarned = coinTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      totalBooksIssued: totalIssued || 0,
      totalReviewsSubmitted: totalReviews || 0,
      totalCoinsEarned,
      currentCoinBalance: profile?.coin_balance || 0,
    };
  },

  async getAdminStats() {
    const [
      { count: totalBooks },
      { count: totalUsers },
      { count: activeIssues },
      { count: pendingRequests },
    ] = await Promise.all([
      supabase
        .from('books')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student'),
      supabase
        .from('book_issues')
        .select('*', { count: 'exact', head: true })
        .is('returned_at', null),
      supabase
        .from('issue_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    return {
      totalBooks: totalBooks || 0,
      totalUsers: totalUsers || 0,
      activeIssues: activeIssues || 0,
      pendingRequests: pendingRequests || 0,
    };
  },
};