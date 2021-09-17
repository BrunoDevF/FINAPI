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
function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === "credit") {
            return acc + operation.amount
        } else {
            return acc - operation.amount
        }
    }, 0)

    return balance
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
    const { description, amount, type } = request.body
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
router.post('/withdraw/:cpf', verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body
    const { costumer } = request

    const balance = getBalance(costumer.statement)

    if (balance < amount) {
        return response.status(400).json({ error: "insufficient funds" })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }
    costumer.statement.push(statementOperation)

    return response.status(200).send()
})

// http://localhost:3333/statement/date/123456789?date=2021-09-17
router.get('/statement/date/:cpf', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request
    const { date } = request.query
    console.log(date)

    const dateFormat = new Date(date + " 00:00")
    const statement = costumer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

    return response.json(statement)

})
router.put('/account/update/:cpf', verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body
    const { costumer } = request

    costumer.name = name

    return response.status(200).json('ok')

})
router.get('/account/:cpf',verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request
    console.log(costumer)
    return response.json(costumer)
})

export { router }