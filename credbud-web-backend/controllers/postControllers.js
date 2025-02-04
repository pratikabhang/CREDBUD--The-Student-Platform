const { addPost, fetchPosts, firebaseVerifyPost,fetchPostsByOwnerId } = require("../utils/firebase");

const createPost = async (req,res)=>{
    const {imageUrl,caption,type,facultyId}=req.body
    const{uid,userData}=req
    console.log(uid,userData,url,caption,type)

    const call = await addPost(imageUrl,uid,userData.name,caption,type,facultyId)
    if (call){
        res.status(200).json({message:"Posted Succesfully"})
    }
    else{
        res.status(500).json({message:"Internal Error while Posting"})

    }
}

const getPosts  =async(req,res)=>{
    const data= await fetchPosts()
    if(data){
        res.status(200).json(data)
    }
    else{
        res.status(500).json({message:"Error while fetching posts"})

    }
}

const verifyPost = async(req,res)=>{
    const {credPoints,postId}=req.body
    const {userData}=req
    const call = await firebaseVerifyPost(postId,credPoints,userData)
    if(call){
        res.status(200).json({message:"Cred Points allocated"})
    }
    else{
        res.status(500).json({message:"Error Allocating Points"})

    }
}

const my =async (req,res)=>{
    const{uid}=req
    fetchPostsByOwnerId(uid).then((data)=>{
        res.status(200).json(data)
    }).catch((error)=>{res.status(500).json("ERROR WHILE FETCHING") })
}


module.exports={createPost,getPosts,verifyPost,my} 