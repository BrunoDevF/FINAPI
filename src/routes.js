import { Router } from "express"
const router = Router()
import { v4 } from 'uuid';

const costumers = []
// middleware
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.params

    const costumer = costumers.find(costumer => costumer.cpf === cpf)

    if (!costumer) {
        return response.status(400).json({ error: "Costumer not found" })
    }

    request.costumer = costumer

    return next();
}

router.post('/account', (req, res) => {
    const { cpf, name } = req.body
    const id = v4();

    const cpfAlreadyExists = costumers.some((costumer) => costumer.cpf === cpf)
    if (cpfAlreadyExists) return res.status(400).json({ error: true, message: 'Already Exists cpf' })

    costumers.push({ name, cpf, id, statement: [] })

    res.status(201).json(costumers)
})
router.get('/account/statement/:cpf', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request
    return response.json({ status: '200 OK', data: costumer.statement })
})
router.post('/deposit/:cpf', verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount,type } = request.body
    const { costumer } = request

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type
    }
    costumer.statement.push(statementOperation)
    return response.status(200).json(costumer.statement)

})


export { router }