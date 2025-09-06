
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title : {type:String, required:[true,'title is required']},
    name : {type: Schema.Types.ObjectId, ref: 'User'},
    starttime : {type:Date,required:[true,'starttime is required']},
    endtime : {type:Date,required:[true,'endtime is required']},
    where : {type:String,required:[true,'location is required']},
    categorytype : {type:String,required:[true,'categorytype is required'],enum:['International Awards','Indian Awards','Russian Awards','British Awards','Australian Awards']},
    images : {type:String,required:[true,'image is required']},
    details : {type:String,required:[true,'details is required'],
               minLength: [10,'details should have atleast 10 characters']},

});

module.exports = mongoose.model('event',eventSchema);
// exports.loop = async () => {
//     try {
//       // Assuming your model is named 'event'
//       const categories = await event.distinct('Topic').exec();
//       categories.sort();
//       return categories;
//     } catch (err) {
//       console.error('Error fetching categories:', err);
//       return [];
//     }
//   };