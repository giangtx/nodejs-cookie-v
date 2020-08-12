import mongoose from 'mongoose';

const City = mongoose.model(
    'city',
    mongoose.Schema({
        id: Number,
        name: String,
        state: String,
        country: String,
        coord:{
            lon: Number,
            lat: Number
        }
    },{collection: 'city'})
)
export default City