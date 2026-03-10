const express = require('express')
let router = express.Router()
let { GenID } = require('../utils/IDHandler')
let slugify = require('slugify')
let categorySchema = require('../schemas/categories');//DBset/DBContext


router.get('/:id', async (req, res) => {//req.params
    try {
        let dataCategories = await categorySchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!dataCategories) {
            res.status(404).send(
                { message: "ID NOT FOUND" }
            )
        } else {
            res.send(dataCategories)
        }
    } catch (error) {
        res.status(404).send(
            { message: "something went wrong" }
        )
    }
})
router.get('/', async (req, res) => {//req.params
    let dataCategories = await categorySchema.find({
        isDeleted: false
    });
    res.send(dataCategories)
})
router.get('/:id/products', (req, res) => {//req.params
    let idCate = req.params.id;
    let filterData = dataCategories.filter(
        function (e) {
            return e.id == idCate;
        }
    )
    if (filterData.length == 0) {
        res.status(404).send("id khong hop le")
    } else {
        let result = dataProducts.filter(
            function (e) {
                return e.category.id == idCate;
            }
        )
        res.send(result)
    }
})
router.post('/', async function (req, res, next) {
    let newItem = new categorySchema({
        name: req.body.name,
        slug: slugify(req.body.name, {
            replacement: '-',
            lower: false,
            remove: undefined,
        }),
        image: req.body.image
    })
    await newItem.save();
    res.send(newItem)
})
router.put('/:id', async function (req, res, next) {
    try {
        // let getItem = await categorySchema.findOne({
        //     isDeleted: false,
        //     _id: req.params.id
        // });
        // if (!getItem) {
        //     res.status(404).send(
        //         { message: "ID NOT FOUND" }
        //     )
        // } else {
        //     let keys  = Object.keys(req.body);
        //     for (const key of keys) {
        //         getItem[key]=req.body[key];
        //     }
        //     await getItem.save();
        //     res.send(getItem)
        // }
        //c2
        let getItem = await categorySchema.findByIdAndUpdate(
            req.params.id, req.body, {
            new: true
        }
        )
        if (getItem) {
            res.send(getItem)
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send(
            { message: error.message }
        )
    }
})
router.delete('/:id', async function (req, res, next) {
    try {
        let getItem = await categorySchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!getItem) {
            res.status(404).send(
                { message: "ID NOT FOUND" }
            )
        } else {
            getItem.isDeleted = true
            await getItem.save();
            res.send(getItem)
        }

    } catch (error) {
        res.status(404).send(
            { message: error.message }
        )
    }
})


module.exports = router;