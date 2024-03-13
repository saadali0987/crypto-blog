const Joi = require("joi")
const Comment = require("../modals/comment.js")
const commentDTO = require("../dto/comment.js")
const mongoIdPattern = /^[0-9a-fA-F]{24}$/


const commentController = {
    async create(req,res,next){
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongoIdPattern).required(),
            blog: Joi.string().regex(mongoIdPattern).required()
        })

        const {error} = createCommentSchema.validate(req.body)

        if(error){
            return next(error);
        }

        const {content, author, blog} = req.body

        try{
            const newComment = new Comment({
                content,
                blog,
                author
            })

            await newComment.save()
        }catch(err){
            return next(err)
        }

        return res.status(201).json({message: "comment created"})


    },

    async getById(req,res,next){
        const getById = Joi.object({
            id: Joi.string().regex(mongoIdPattern).required()
        })

        const {error} = getById.validate(req.params)

        if(error){
            return next(err);
        }

        const {id} = req.params

        let comments;
        try{
            comments = await Comment.find({blog:id}).populate("author")
        }catch(err){
            return next(err)
        }

        let commentsDto = []
        for(let i = 0; i<comments.length; i++){
            const object = new commentDTO(comments[i]);
            commentsDto.push(obj)
        }

        return res.status(200).json({data:commentsDto})
    }
}


module.exports = commentController