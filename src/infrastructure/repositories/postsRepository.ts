import { EmployerPosts } from "../../interfaces/models/employerPosts";
import IPostsRepository from "../../interfaces/iRepositories/iPostRepository";
import postsModel from "../../entities_models/postModel";
import mongoose from "mongoose";

class PostsRepository implements IPostsRepository {

    async fetchPostsById(employer_id: string, skip:number, limit:number, sort:string): Promise<EmployerPosts | any> {
        try {
            let sortQuery: 1 | -1 = 1;

            if (sort === 'newest') {
                sortQuery = -1;
            } else if (sort === 'oldest') {
                sortQuery = 1;
            }

            const posts = await postsModel.aggregate([
                { $match: { employer_id: new mongoose.Types.ObjectId(employer_id) } },
                { $unwind: '$posts' },
                { $skip: skip },
                { $limit: limit },
                { $sort:  { 'posts._id':sortQuery } },
                { $group: {
                    _id: '$_id',
                    posts: { $push: '$posts' }
                }},
                { $unwind: '$posts' },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'posts.comments.user_id',
                    foreignField: '_id',
                    as: 'userDetails'
                  }
                },
                {
                  $project: {
                    _id: '$posts._id',
                    employer_id: '$employer_id',
                    image_urls: '$posts.image_urls',
                    description: '$posts.description',
                    likes: '$posts.likes',
                    saved: '$posts.saved',
                    postedAt: '$posts.postedAt',
                    comments: {
                      $map: {
                        input: '$posts.comments',
                        as: 'comment',
                        in: {
                          _id: '$$comment._id',
                          comment: '$$comment.comment',
                          createdAt: '$$comment.createdAt',
                          user: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$userDetails',
                                  cond: { $eq: ['$$this._id', '$$comment.user_id'] }
                                }
                              },
                              0
                            ]
                          }
                        }
                      }
                    }
                  }
                },
            ]);  
            
            return posts || null
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async fetchTotalNoOfEmployerPosts(employer_id: string, skip:number = 0, limit:number = 0, searchQuery?:string): Promise<number> {
        try {
            if (searchQuery) {
            
                const searchedPosts:any = await postsModel.find(
                    { employer_id: employer_id,
                      "posts.description": { $regex: searchQuery , $options: 'i' }
                    },
                    { "posts.$": 1 } 
                ).skip(skip).limit(limit)
    
                console.log(searchedPosts.length);
               
                return searchedPosts.length ? searchedPosts.length : 0
                
            } else {
                const postsCount = await postsModel.findOne(
                    { employer_id: employer_id }
                )        
        
                return postsCount?.posts.length || 0
            }
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async triggerPostLike(employer_Id: string, post_Id: string, user_Id: string): Promise<EmployerPosts | any> {
        try {
            const post:any = await postsModel.findOne(
                { employer_id: employer_Id, 'posts._id': post_Id },
                { 'posts.$': 1 }
            );
    
            if (!post || post.posts.length === 0) {
                throw new Error('Post not found');
            }
    
            const userLiked = post.posts[0].likes.includes(user_Id);
    
            const updateQuery = userLiked ? { $pull: { 'posts.$.likes': user_Id } } : { $addToSet: { 'posts.$.likes': user_Id } };
    
            await postsModel.updateOne(
                { 'employer_id': employer_Id, 'posts._id': post_Id },
                updateQuery
            );
    
            const updatedEmployer = await postsModel.aggregate([
                { $match: { 'employer_id': new mongoose.Types.ObjectId(employer_Id) } },
                { $unwind: '$posts' },
                { $match: { 'posts._id': new mongoose.Types.ObjectId(post_Id) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "posts.comments.user_id",
                        foreignField: "_id",
                        as: "posts.comments.user"
                    }
                },
                {
                    $addFields: {
                        'posts.employer_id': '$employer_id'
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        post: { $first: "$posts" }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$post"
                    }
                }
            ]);
    
            if (!updatedEmployer || updatedEmployer.length === 0) {
                throw new Error('Failed to fetch updated post');
            }
    
            return updatedEmployer[0];
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async triggerPostSave(employer_Id: string, post_Id: string, user_Id: string): Promise<EmployerPosts> {
        try {
            
            const userObjectId = new mongoose.Types.ObjectId(user_Id);

            const post = await postsModel.findOne(
                { employer_id: new mongoose.Types.ObjectId(employer_Id), "posts._id": new mongoose.Types.ObjectId(post_Id) },
                { "posts.$": 1 }
            );

            if (!post) {
                throw new Error('Post not found');
            }

            const isSaved = post.posts[0].saved.includes(user_Id);

            let update;
            if (isSaved) {
                update = {
                    $pull: { "posts.$.saved": userObjectId }
                };
            } else {
                update = {
                    $addToSet: { "posts.$.saved": userObjectId }
                };
            }

            const updateResult = await postsModel.updateOne(
                { employer_id: new mongoose.Types.ObjectId(employer_Id), "posts._id": new mongoose.Types.ObjectId(post_Id) },
                update
            );

            if (updateResult.modifiedCount === 0) {
                throw new Error('Failed to update the post');
            }

            const result = await postsModel.aggregate([
                { $match: { employer_id: new mongoose.Types.ObjectId(employer_Id) } },
                { $unwind: "$posts" },
                { $match: { "posts._id": new mongoose.Types.ObjectId(post_Id) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "posts.comments.user_id",
                        foreignField: "_id",
                        as: "posts.comments.user"
                    }
                },
                {
                    $unwind: {
                        path: "$posts.comments",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$posts.comments.user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            postId: "$posts._id",
                            commentId: "$posts.comments._id"
                        },
                        post: { $first: "$posts" },
                        comment: { $first: "$posts.comments" }
                    }
                },
                {
                    $sort: {
                        "comment.createdAt": -1
                    }
                },
                {
                    $group: {
                        _id: "$_id.postId",
                        post: { $first: "$post" },
                        comments: { $push: "$comment" }
                    }
                },
                {
                    $addFields: {
                        "post.comments": "$comments"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        posts: { $push: "$post" }
                    }
                }
            ]);

            if (!result || result.length === 0 || !result[0].posts || result[0].posts.length === 0) {
                console.log('Failed to fetch updated document', result);
                throw new Error('Failed to fetch updated document');
            }

            const updatedPost = result[0].posts[0];

            return updatedPost;
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async addCommentByPostId(user_Id: string, employer_Id: string, post_Id: string, comment: string): Promise<any> {
        try {

            const updateResult = await postsModel.updateOne(
                { employer_id: new mongoose.Types.ObjectId(employer_Id), 
                  "posts._id": new mongoose.Types.ObjectId(post_Id) },
                {  $push: { "posts.$.comments": { user_id: new mongoose.Types.ObjectId(user_Id), comment: comment } } }
            );
            
            if (updateResult.modifiedCount === 0) {
                throw new Error('No matching document found or update failed');
            }
            
            const result = await postsModel.aggregate([
                {  $match: { employer_id: new mongoose.Types.ObjectId(employer_Id), "posts._id": new mongoose.Types.ObjectId(post_Id) } },
                {  $unwind: "$posts" },
                {  $match: { "posts._id": new mongoose.Types.ObjectId(post_Id) } },
                {  $unwind: "$posts.comments" },
                {  $lookup: {
                        from: "users", 
                        localField: "posts.comments.user_id",
                        foreignField: "_id",
                        as: "posts.comments.user"
                    }
                },
                {  $unwind: {
                        path: "$posts.comments.user",
                        preserveNullAndEmptyArrays: true 
                    }
                },
                {
                    $group: { _id: {
                            postId: "$posts._id",
                            commentId: "$posts.comments._id" 
                        },
                        post: { $first: "$posts" },
                        comment: { $first: "$posts.comments" }
                    }
                },
                {   $sort: { "comment.createdAt": -1 } },
                {   $group: {
                        _id: "$_id.postId",
                        post: { $first: "$post" },
                        comments: { $push: "$comment" }
                    }
                },
                {   $addFields: { "post.comments": "$comments" } },
                {   $replaceRoot: { newRoot: "$post" } }
            ]);
            
            if (!result || result.length === 0 || !result[0].comments || result[0].comments.length === 0) {
                console.log('Failed to fetch updated document', result);
                throw new Error('Failed to fetch updated document');
            }
            
            const updatedPost = result[0];
            const newComment = updatedPost.comments[0];
            return newComment;
        } catch (error) {
            console.error('Error in addCommentByPostId:', error);
            throw error;
        }
    }
 
    async addPost(description: string,employer_id:string, images?: string[] | undefined): Promise<EmployerPosts[] | any> {
        try {
            const result = await postsModel.findOneAndUpdate(
                { employer_id: employer_id }, 
                { $push: { posts: { description: description, image_urls: images } } }, 
                { upsert: true, new: true }
            );
            
            return result.posts[result.posts.length-1] || null
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async fetchAPerticularPost(employer_id: string, post_id: string): Promise<EmployerPosts | null> {
        try {
            const post = await postsModel.findOne(
                { employer_id:employer_id,'posts._id': post_id  },
                { 'posts.$': 1 }
            )
    
            if (post) {
                return post
            } else {
                return null
            }
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async editPost(employer_id: string, post_id: string, description: string, images?: string[] | undefined): Promise<EmployerPosts | null> {
        try {
            const result = await postsModel.findOneAndUpdate(
                { employer_id: employer_id, 'posts._id': post_id }, 
                { $set: { 'posts.$.description': description, 'posts.$.image_urls':images } }, 
                { new: true }
            );
    
            if (result) {
                return result
            } else {
                return null
            }
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async fetchAllPosts(skip: number, limit: number): Promise<any> {
        try {
            console.log(`skip :${skip} limit:${limit}`);
            
            const result = await postsModel.aggregate([
                { $unwind: '$posts' },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'posts.comments.user_id',
                    foreignField: '_id',
                    as: 'userDetails'
                  }
                },
                {
                  $project: {
                    _id: '$posts._id',
                    employer_id: '$employer_id',
                    image_urls: '$posts.image_urls',
                    description: '$posts.description',
                    likes: '$posts.likes',
                    saved: '$posts.saved',
                    postedAt: '$posts.postedAt',
                    comments: {
                      $map: {
                        input: '$posts.comments',
                        as: 'comment',
                        in: {
                          _id: '$$comment._id',
                          comment: '$$comment.comment',
                          createdAt: '$$comment.createdAt',
                          user: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$userDetails',
                                  cond: { $eq: ['$$this._id', '$$comment.user_id'] }
                                }
                              },
                              0
                            ]
                          }
                        }
                      }
                    }
                  }
                },
                { $sort: { postedAt: -1 } },
                { $skip: skip },
                { $limit: limit }
              ]);            
        
            if (result) {            
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log(error);
            throw error
        }
    }    

    async fetchTotalNoOfPosts() {
        try {
            const postsCount = await postsModel.aggregate([
                { $unwind: "$posts" },        
                { $count: "totalPosts" }      
            ]);
            
            return postsCount[0]?.totalPosts || 0
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async fetchSearchedPosts(company_id:string, skip:number, limit:number, sort:string, query?:string): Promise<any> {
        try {
            let sortQuery: -1 | 1 = 1;

            if (sort == 'newest') {
                sortQuery = -1
            } else if (sort == 'oldest') {
                sortQuery = 1
            }

            const searchedPosts:any = await postsModel.find(
                { employer_id: company_id,
                "posts.description": { $regex: query , $options: 'i' }
                },
                { "posts.$": 1 } 
            ).sort({ _id:sortQuery })

            console.log(searchedPosts);
            

            if (searchedPosts[0]?.posts) {
                return searchedPosts[0]?.posts
            } else {
                return null
            }
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async deletePostById(employer_id: string, post_id: string): Promise<EmployerPosts> {
        try {
            const deletePost = await postsModel.findOneAndUpdate(
                { employer_id: employer_id },
                { $pull: { posts: { _id: post_id } } }
            ) 

            if (!deletePost) {
                throw new Error('Post not exists')
            } else {
                console.log('deletion success');
                
            }

            return deletePost
        } catch (error) {
            throw error
        }
    }

}

export default PostsRepository