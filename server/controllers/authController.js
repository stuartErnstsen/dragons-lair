const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const { username, password, isAdmin } = req.body;

        const db = req.app.get('db')
        const newUser = await db.get_user([username])
        if (newUser[0]) {
            return res.status(409).send('Username is taken')
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const registeredUser = await db.register_user([isAdmin, username, hash])
        req.session.user = registeredUser[0]
        res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        const { username, password } = req.body;
        const db = req.app.get('db')

        const foundUser = await db.get_user([username])
        if (!foundUser[0]) {
            res.status(401).send('Username not found')
        }
        const isAuthenticated = bcrypt.compareSync(password, foundUser[0].hash)
        if (!isAuthenticated) {
            res.status(403).send('Password is incorrect')
        }
        delete foundUser[0].password;
        req.session.user = foundUser[0]
        res.status(200).send(req.session.user)
    },
    logout: async (req, res) => {
        req.session.destroy()
        res.sendStatus(200)
    }

}