const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Event = require('./models/event')
const User = require('./models/user')

const app = express()

app.use(bodyParser.json())
// query = fetching data
// mutation = changing data
// here we are creating endpoints
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event._doc._id.toString() }
                })
            }).catch(err => console.log(err))
        },
        createEvent: ({eventInput}) => {
            const event = new Event({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date),
                creator: '5ddcca3ca049b05711b7a7e6'
            })
            let createdEvent
            return event
            .save()
            .then(result => {
                createdEvent = {...result._doc, _id: result.id }
                return User.findById('5ddcca3ca049b05711b7a7e6')
            })
            .then(user => {
                console.log("TCL: user", user)
                if (!user) {
                    throw new Error('User is not found!')
                }
                user.createdEvents.push(createdEvent)
                return user.save()
            })
            .then(result => {
                return createdEvent
            })
            .catch(err => {
                console.log(err)
                throw err
            })
        },
        createUser: ({userInput}) => {
            return User.findOne({ email: userInput.email })
            .then(user => {
                if (user) {
                    throw new Error('User already exists.')
                }
                return bcrypt.hash(userInput.password, 12)
            })
            .then(hashedPassword => {
                const user = new User({
                    email: userInput.email,
                    password: hashedPassword
                })
                return user.save()
            })
            .then(result => {
                console.log(result)
                return { ...result._doc, password: null, _id: result.id }
            })
            .catch(err => {
                throw err
            })
        }
    },
    graphiql: true
}))

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mycluster-g3mr4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true }).then(() => {
    app.listen(3000)
}).catch(err => {
    console.log(err)
})
