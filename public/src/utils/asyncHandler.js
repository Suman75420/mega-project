const asyncHandler = () => {

(req,res,next) => {

}
}



export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asynHandler = (fun) => async () => {}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//       await fn(req,res,next)
//     } catch (error){
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message
//         })
//     }
//     }