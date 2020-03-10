const express = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/orders', auth, async (req, res) => {
    const order = new Order(
        // req.body,req.user._id)
        {
        ...req.body,
        owner: req.user._id
    })

    try {
        await order.save()
        res.status(201).send(order)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /orders?completed=true
// GET /orders?limit=10&skip=20
// GET /orders?sortBy=createdAt:desc
router.get('/orders', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'orders',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/orders/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const order = await Order.findOne({ _id, owner: req.user._id })

        if (!order) {
            return res.status(404).send()
        }

        res.send(order)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/orders/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['product', 'available']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const order = await Order.findOne({ _id: req.params.id, owner: req.user._id})

        if (!order) {
            return res.status(404).send()
        }

        updates.forEach((update) => order[update] = req.body[update])
        await order.save()
        res.send(order)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/orders/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!order) {
            res.status(404).send()
        }

        res.send(order)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router