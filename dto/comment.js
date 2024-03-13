class commentDTO{
    constructor(comment){
        this._id = comment._id;
        this.createdAt = comment.createdAt
        this.content = comment.author
        this.authorUsername = comment.author.username

    }
}


module.exports = commentDTO