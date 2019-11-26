const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')

const app = express()

const events = []

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

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return events
        },
        createEvent: ({eventInput}) => {
            const event = {
                _id: Math.random().toString(),
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: eventInput.date
            }
            events.push(event)
            return event
        }
    },
    graphiql: true
}))

app.listen(3000)