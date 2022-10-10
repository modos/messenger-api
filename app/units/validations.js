function validateSignUpBody(req, res, next) {
    if (req.body.name === undefined || req.body.password === undefined || req.body.email === undefined) {
        return res.status(400).json({error: {message: "Bad request!"}})
    }
    next()
}

function validateLoginBody(req, res, next) {
    if (req.body.email === undefined || req.body.password === undefined) {
        return res.status(400).json({error: {message: "Bad request!"}})
    }
    next()
}

function validateCreateGroupBody(req, res, next) {
    if (req.body.name === undefined || req.body.description === undefined) {
        return res.status(400).json({error: {message: "Bad request!"}})
    }
    next()
}

module.exports = {
    validateSignUpBody,
    validateLoginBody,
    validateCreateGroupBody
}