const Blog = require("../modals/blog.js")
const Joi = require("joi")
const fs = require("fs")
const {BACKEND_SERVER_PATH} = require("../config/index.js")
const BlogDTO = require("../dto/blog.js")
const BlogDetailsDto = require("../dto/blogDetails.js")
const Comment = require("../modals/comment.js")
const mongoIdPattern = /^[0-9a-fA-F]{24}$/


const blogController = {
    async create(req,res,next){
        const createBlogSchema = Joi.object({
            title : Joi.string().required(),
            author: Joi.string().regex(mongoIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required()
        })

        const {error} = createBlogSchema.validate(req.body)
        if(error){
            return next(error);
        }

        const {title, content, author, photo} = req.body

        //read as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,''), 'base64')

        //random name
        const imagePath = `${Date.now()}-${author}.png`

        //save locally
        try{
            fs.writeFileSync(`storage/${imagePath}`, buffer)
        }catch(err){
            return next(err)
        }

        //save blog in db
        let newBlog
        try{
                newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            })
            await newBlog.save()
        }catch(err){
            return next(err)
        }

        const blogDto = new BlogDTO(newBlog)
        res.status(201).json({blog:blogDto})

    },



    async getAll(req,res,next){
        try{
            const blogs = await Blog.find({})
            console.log(blogs)
            const blogsDTO = []

            for(let i=0; i<blogs.length; i++){
                const blogDTO = new BlogDTO(blogs[i]);
                blogsDTO.push(blogDTO)
            }

            res.status(200).json({blogs: blogsDTO})
        }catch(err){
            return next(err)
        }
    },      



    async getById(req,res,next){
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongoIdPattern).required()
        })

        const {error} = getByIdSchema.validate(req.params)

        if(error){
            return next(error);
        }

        let blog;

        try{
            blog = await Blog.findOne({_id:req.params.id}).populate("author");
        }catch(err){
            return next(err);
        }

        const blogdto = new BlogDetailsDto(blog);
        return res.status(200).json({blog:blogdto});

    },


    async update(req,res,next){
        const udpateBlogSchema = Joi.object({
            title: Joi.string(),
            content: Joi.string(),
            author: Joi.string().regex(mongoIdPattern).required(),
            blogId: Joi.string().regex(mongoIdPattern).required(),
            photo: Joi.string()
        })

        const {error} = udpateBlogSchema.validate(req.body)


        const {title, content, blogId, author, photo} = req.body

        //delete previous photo

        let blog;
        try{
            blog = await Blog.findOne({_id:blogId})

        }catch(err){
            return next(err);
        }

        if(photo){
            let previousPhotoPath = blog.photoPath;
            let previousPhotoName = previousPhotoPath.split("/").at(-1);

            //delete photo
            fs.unlinkSync(`storage/${previousPhotoName}`)


            const buffer = Buffer.from(photo .replace(/^data:image\/(png|jpg|jpeg);base64,/,''), 'base64')

        //random name
        const imagePath = `${Date.now()}-${author}.png`

        //save locally
        try{
            fs.writeFileSync(`storage/${imagePath}`, buffer)
        }catch(err){
            return next(err)
        }

        await Blog.updateOne({_id:blogId},
            {title, content, photoPath:`${BACKEND_SERVER_PATH}/storage/{imagePath}`})
        }
        else
        {
            await Blog.updateOne({id:_id}, {title, content});
        }

        return res.status(200).json({message: 'blog updated'})
        


    },



    async delete(req,res,next){
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongoIdPattern).required()
        })

        const {error} = deleteBlogSchema.validate(req.params)

        const {id} = req.params

        try{
            await Blog.deleteOne({_id:id})
            await Comment.deleteMany({blog:id})

        }catch(err){
            return next(err)
        }

        return res.status(200).json({message: 'blog deleted'})


    }
}


module.exports = blogController