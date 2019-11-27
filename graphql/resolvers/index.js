const bcrypt = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')
const Booking = require('../../models/booking')


const events = async eventIds => {
    const event = await Event.find({ _id: {$in: eventIds }})
            return event.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event.date).toISOString(),
                    creator: user.bind(this, event.creator)
                }
            })
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
                return { ...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }
    }
    catch (err) {
        throw err
    }

}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
                return events.map(event => {
                    return {
                        ...event._doc,
                        _id: event._id,
                        date: new Date(event.date).toISOString(),
                        creator: user.bind(this, event._doc.creator)
                    }
                })
        }
        catch (err) {
            console.log(err)
            throw err
        }
    },
    users: async () => {
        const users = await User.find()
            return users.map(user => {
                return {
                    ...user._doc,
                    _id: user.id,
                    createdEvents: events.bind(this, user._doc.createdEvents)
                }
            })
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find()
                return bookings.map(booking => {
                    return {
                        ...booking._doc,
                        _id: booking.id,
                        createdAt: new Date(booking.createdAt).toISOString(),
                        updatedAt: new Date(booking.updatedAt).toISOString()
                    }
                })
        } catch (err) {
            throw err
        }
    },
    createEvent: async ({eventInput}) => {
        const event = new Event({
            title: eventInput.title,
            description: eventInput.description,
            price: +eventInput.price,
            date: new Date(eventInput.date),
            creator: '5ddcca3ca049b05711b7a7e6'
        })
        try {
            let createdEvent
            const result = await event.save()
                createdEvent = {
                    ...result._doc,
                     _id: result.id,
                     date: new Date(result.date).toISOString(),
                    creator: user.bind(this, result._doc.creator)
                    }
                const foundUser = await User.findById('5ddcca3ca049b05711b7a7e6')
                if (!foundUser) {
                    throw new Error('User is not found!')
                }
                foundUser.createdEvents.push(createdEvent)
                await foundUser.save()
                return createdEvent
        }
        catch (err){
            console.log(err)
            throw err
        }
    },
    createUser: async ({userInput}) => {
        try {
            const existingUser = await User.findOne({ email: userInput.email })
                if (existingUser) {
                    throw new Error('User already exists.')
                }
                const hashedPassword = await bcrypt.hash(userInput.password, 12)
                const newUser = new User({
                    email: userInput.email,
                    password: hashedPassword
                })
                const result = await newUser.save()
                return { ...result._doc, password: null, _id: result.id }
        }
        catch (err){
            throw err
        }
    },
    bookEvent: async ({eventId}) => {
        try {
            const fetchedEvent = await Event.findOne({ _id: eventId })
            console.log("TCL: fetchedEvent", fetchedEvent.id)
            const booking = new Booking({
                user: '5ddcca3ca049b05711b7a7e6',
                event: fetchedEvent.id
            })
            const result = await booking.save()
            return {
                ...result._doc,
                _id: result.id,
                createdAt: new Date(result.createdAt).toISOString(),
                updatedAt: new Date(result.updatedAt).toISOString()
            }
        } catch (err) {
            throw err
        }
    }
}