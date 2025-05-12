import mongoose, {Schema} from "mongoose";




const SubcriptionSchema= new Schema({

    subcriber:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    channel:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }

},{timestamps: true})

export const subcription= subcription.model("subcription",SubcriptionSchema);