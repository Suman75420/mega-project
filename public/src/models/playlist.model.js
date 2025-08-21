import mongoose ,{Schema} from "Schema";

const playlistSchema = new Schema(
    {
        name :{
            type : "String",
            required : true
        },
        description : {
            type : "String",
            required : true
        },
        videos : [ {
            type : Schema.Types.ObjectId,
            ref : "Video"
        } ],
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }

    },
   {
    timeStamps : true
   }
)
export const playlist = mongoose.model("Playlist",playlistSchema)