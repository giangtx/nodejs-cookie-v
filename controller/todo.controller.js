import Todo from '../model/Todo';

class TodoController{
    async getAll(request, response) {
        try {
            const todos = await Todo.find({}).limit(100)
            if (todos.length > 0){
                response.json({
                    status: 200,
                    data: todos,
                    message: 'select list todo success!'
                })
            } else {
                response.json({
                    status: 0,
                    data: {},
                    message: 'cannot find list todo'
                })
            }
        } catch (error) {
            response.json({
                status: 500,
                data: {},
                message: 'error is: ' + error
            })
        }
    }
    // async getById(request, response) {
    //     let { id } = request.params
    //     try {
    //         const todo = await Todo.findOne
    //     } catch (error) {
            
    //     }
    // }
}
export default new TodoController();