import City from '../model/City'

class CityController{
    async getAPI(request , response) {
        let { name, country, size} = request.query;
        let page = parseInt(request.query.page) || 1;
        let limit = parseInt(size) || 10;
        try {
            let where = {}; 
            if(name && country){
                where = { name, country }
            }
            else if(name){
                where = { name }
            }else if(country){
                where = { country }
            }
            const city = await City.find(where).limit(limit).skip(limit * ( page-1 ))
            const count = await City.countDocuments(where)
            // const city = await City.find(where).limit(size ? parseInt(size) : 10).skip((size ? parseInt(size) : 10) * ((page == 0 || !page) ? 0 : (parseInt(page)-1)))
            if (city.length > 0) {
                response.json ({
                    status: 200,
                    data: city,
                    message:'select city success',
                    length:city.length,
                    currentPage: page,
                    size: limit,
                    totalPage: Math.ceil(count/limit),
                    totalElements: count
                })
            }else{
                response.json( {
                    status: 0,
                    data: {},
                    message:'cannot find city'
                })
            }
        } catch (error) {
            response.status(500).send({
                message:
                error.message || "Some error occurred while find city by country."
            });
        }
    }

}
export default new CityController();