import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const reviewSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        releaseDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
)

mongoose.plugin(mongooseAggregatePaginate)
export const user = mongoose.model(review, reviewSchema)