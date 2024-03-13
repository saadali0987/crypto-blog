class BlogDetailsDto{
    constructor(blog){
        this.title = blog.title
        this.content = blog.content
        this.photo = blog.photoPath
        this.id = blog._id
        this.authorName = blog.author.name;
        this.authorUsername = blog.author.username;
        this.createdAt = blog.createdAt;

    }
}


module.exports = BlogDetailsDto;