function validateSignUpBody(req, res, next) {
    console.log(req.body);
    if (req.body.name === undefined || req.body.password === undefined || req.body.email === undefined) {
        return res.status(400).json({error: {message: "Bad request!"}})
    }
    next()
}

module.exports = {
    validateSignUpBody
}