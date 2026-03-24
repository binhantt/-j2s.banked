package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.Blog;
import com.example.bankend_hovan_J2.domain.blog.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogService {
    
    private final BlogRepository blogRepository;

    public List<BlogResponse> getAllBlogs(String source) {
        List<Blog> blogs;
        
        if (source != null && !source.isEmpty()) {
            Blog.BlogSource blogSource = Blog.BlogSource.valueOf(source.toUpperCase());
            blogs = blogRepository.findBySourceOrderByCreatedAtDesc(blogSource);
        } else {
            blogs = blogRepository.findAllByOrderByCreatedAtDesc();
        }
        
        return blogs.stream()
                .map(BlogResponse::from)
                .collect(Collectors.toList());
    }

    public BlogResponse getBlogById(Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
        
        // Increment view count
        blog.setViews(blog.getViews() + 1);
        blogRepository.save(blog);
        
        return BlogResponse.from(blog);
    }

    public List<BlogResponse> getBlogsByCompany(Long companyId) {
        List<Blog> blogs = blogRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        return blogs.stream()
                .map(BlogResponse::from)
                .collect(Collectors.toList());
    }

    public BlogResponse createBlog(CreateBlogRequest request) {
        Blog.BlogSource source = Blog.BlogSource.valueOf(request.getSource().toUpperCase());
        
        // Validate company blog requirements
        if (source == Blog.BlogSource.COMPANY && request.getCompanyId() == null) {
            throw new RuntimeException("Company ID là bắt buộc cho blog công ty");
        }

        Blog blog = Blog.builder()
                .title(request.getTitle())
                .excerpt(request.getExcerpt())
                .content(request.getContent())
                .author(request.getAuthor())
                .authorAvatar(request.getAuthorAvatar())
                .category(request.getCategory())
                .image(request.getImage())
                .readTime(request.getReadTime() != null ? request.getReadTime() : "5 phút đọc")
                .views(0)
                .source(source)
                .tags(request.getTags())
                .companyId(request.getCompanyId())
                .build();

        Blog savedBlog = blogRepository.save(blog);
        return BlogResponse.from(savedBlog);
    }

    public BlogResponse updateBlog(Long id, CreateBlogRequest request) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));

        blog.setTitle(request.getTitle());
        blog.setExcerpt(request.getExcerpt());
        blog.setContent(request.getContent());
        blog.setAuthor(request.getAuthor());
        blog.setAuthorAvatar(request.getAuthorAvatar());
        blog.setCategory(request.getCategory());
        blog.setImage(request.getImage());
        blog.setReadTime(request.getReadTime());
        blog.setTags(request.getTags());

        Blog savedBlog = blogRepository.save(blog);
        return BlogResponse.from(savedBlog);
    }

    public void deleteBlog(Long id) {
        if (!blogRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy bài viết với ID: " + id);
        }
        blogRepository.deleteById(id);
    }

    public void deleteBlogByCompany(Long id, Long companyId) {
        Blog blog = blogRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết hoặc bạn không có quyền xóa"));
        blogRepository.delete(blog);
    }

    public List<BlogResponse> searchBlogs(String keyword, String source) {
        List<Blog> blogs;
        
        if (source != null && !source.isEmpty()) {
            Blog.BlogSource blogSource = Blog.BlogSource.valueOf(source.toUpperCase());
            blogs = blogRepository.findBySourceAndKeyword(blogSource, keyword);
        } else {
            blogs = blogRepository.findByKeyword(keyword);
        }
        
        return blogs.stream()
                .map(BlogResponse::from)
                .collect(Collectors.toList());
    }
}